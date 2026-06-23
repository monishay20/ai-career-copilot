import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { rewriteRatelimit } from "@/lib/ratelimit";
import { rewriteSchema } from "@/lib/validation";
import { logAIRequest } from "@/lib/aiLogger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function rewriteWithGemini(resumeText: string, jobDescription?: string) {
  const models = [
    "gemini-2.5-flash",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite-001",
  ];

  const prompt = `You are an expert resume writer and career coach.

Your task is to rewrite weak resume bullet points into strong, quantified, ATS-optimized ones.

Rules:
- Use strong action verbs (Developed, Implemented, Architected, Led, Optimized, etc.)
- Add metrics where possible (e.g. "serving 5,000+ users", "reducing load time by 40%")
- Keep each bullet concise but impactful
- Make it ATS-friendly with relevant keywords
${jobDescription ? "- Tailor rewrites to match the job description provided" : ""}

Return a JSON object with this exact structure:
{
  "rewrites": [
    {
      "section": "<section name e.g. Experience, Skills, Summary>",
      "original": "<original weak bullet or sentence>",
      "rewritten": "<improved strong version>",
      "explanation": "<one line explaining what was improved>"
    }
  ],
  "improvedSummary": "<a completely rewritten professional summary if one exists, otherwise null>"
}

Resume:
${resumeText}

${jobDescription ? `Job Description:\n${jobDescription}` : ""}

Identify the 5-8 weakest bullet points and rewrite them.
Return ONLY the JSON object, no markdown, no explanation, no backticks.`;

  let lastError;
  for (const modelName of models) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (error: any) {
      console.log(`Model ${modelName} failed: ${error.message}`);
      lastError = error;
      continue;
    }
  }

  throw lastError;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const { success } = await rewriteRatelimit.limit(userId);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes before rewriting again." },
        { status: 429 }
      );
    }

    // Validation
    const body = await req.json();
    const parsed = rewriteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error?.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { analysisId } = parsed.data;

    // Get analysis + resume text from DB
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      include: { resume: true },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    const startTime = Date.now();
    let rewriteSuccess = true;
    let rewriteError = "";

    let rewrites;
    try {
      rewrites = await rewriteWithGemini(
        analysis.resume.rawText,
        analysis.jobDescription ?? undefined
      );
    } catch (error: any) {
      rewriteSuccess = false;
      rewriteError = error.message;
      throw error;
    } finally {
      await logAIRequest({
        userId,
        action: "rewrite",
        model: "gemini-2.5-flash",
        responseTime: Date.now() - startTime,
        success: rewriteSuccess,
        errorMessage: rewriteError || undefined,
      });
    }

    return NextResponse.json(rewrites);
  } catch (error: any) {
    console.error("Rewrite error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}