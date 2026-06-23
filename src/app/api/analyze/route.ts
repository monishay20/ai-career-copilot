import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import * as mammoth from "mammoth";
import { analyzeRatelimit } from "@/lib/ratelimit";
import { analyzeSchema } from "@/lib/validation";
import { logAIRequest } from "@/lib/aiLogger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function extractText(buffer: ArrayBuffer, fileName: string): Promise<string> {
  if (fileName.endsWith(".pdf")) {
    const { getResolvedPDFJS } = await import("unpdf");
    const pdfjsLib = await getResolvedPDFJS();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return text;
  }

  if (fileName.endsWith(".docx")) {
    const result = await mammoth.extractRawText({
      buffer: Buffer.from(buffer),
    });
    return result.value;
  }

  throw new Error("Unsupported file type");
}

async function analyzeWithGemini(resumeText: string, jobDescription?: string) {
  const models = [
    "gemini-2.5-flash",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite-001",
  ];

  const prompt = `You are an expert resume reviewer and ATS (Applicant Tracking System) specialist.

Analyze the following resume and return a JSON object with this exact structure:
{
  "atsScore": <number 0-100>,
  "sections": {
    "summary": { "score": <0-100>, "feedback": "<feedback>", "suggestions": ["<suggestion1>", "<suggestion2>"] },
    "experience": { "score": <0-100>, "feedback": "<feedback>", "suggestions": ["<suggestion1>", "<suggestion2>"] },
    "skills": { "score": <0-100>, "feedback": "<feedback>", "suggestions": ["<suggestion1>", "<suggestion2>"] },
    "education": { "score": <0-100>, "feedback": "<feedback>", "suggestions": ["<suggestion1>", "<suggestion2>"] }
  },
  "grammarIssues": ["<issue1>", "<issue2>"],
  "actionVerbStrength": { "score": <0-100>, "weakVerbs": ["<verb1>"], "suggestions": ["<stronger verb suggestion>"] },
  "overallSuggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"]
  ${jobDescription ? `,
  "jobMatch": {
    "matchScore": <0-100>,
    "matchedKeywords": ["<keyword1>", "<keyword2>"],
    "missingKeywords": ["<keyword1>", "<keyword2>"],
    "tailoredSuggestions": ["<suggestion1>", "<suggestion2>"],
    "experienceGaps": [
      {
        "required": "<what the job requires>",
        "candidate": "<what the resume shows>",
        "gap": "<what is missing>"
      }
    ],
    "educationMatch": {
      "required": "<education the job requires>",
      "candidate": "<education on resume>",
      "match": <true or false>,
      "note": "<explanation>"
    }
  }` : ""}
}

Resume:
${resumeText}

${jobDescription ? `Job Description:\n${jobDescription}` : ""}

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
    const { success } = await analyzeRatelimit.limit(userId);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes before analyzing again." },
        { status: 429 }
      );
    }

    // Get form data
    const formData = await req.formData();
    const fileEntry = formData.get("file");
    const jobDescription = formData.get("jobDescription") as string;

    // File existence check
    if (!fileEntry || !(fileEntry instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const file = fileEntry;

    // File type validation
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF or DOCX files are allowed" }, { status: 400 });
    }

    // File size validation
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be under 4MB" }, { status: 400 });
    }

    // Zod validation
    const parsed = analyzeSchema.safeParse({ jobDescription });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error?.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const fileName = file.name;
    const buffer = await file.arrayBuffer();

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const rawText = await extractText(buffer, fileName);
    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json({ error: "Could not extract text from file" }, { status: 400 });
    }

    const startTime = Date.now();
    let usedModel = "gemini-2.5-flash";
    let analysisSuccess = true;
    let analysisError = "";

    let analysis;
    try {
      analysis = await analyzeWithGemini(rawText, jobDescription);
    } catch (error: any) {
      analysisSuccess = false;
      analysisError = error.message;
      throw error;
    } finally {
      await logAIRequest({
        userId,
        action: "analyze",
        model: usedModel,
        responseTime: Date.now() - startTime,
        success: analysisSuccess,
        errorMessage: analysisError || undefined,
      });
    }

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        fileName,
        fileUrl: "",
        rawText,
        version: 1,
      },
    });

    const savedAnalysis = await prisma.analysis.create({
      data: {
        resumeId: resume.id,
        atsScore: analysis.atsScore,
        feedback: analysis.sections,
        jobDescription: jobDescription || null,
        matchScore: analysis.jobMatch?.matchScore ?? null,
        matchedKeywords: analysis.jobMatch?.matchedKeywords ?? null,
        missingKeywords: analysis.jobMatch?.missingKeywords ?? null,
        suggestions: {
          overall: analysis.overallSuggestions,
          grammarIssues: analysis.grammarIssues,
          actionVerbs: analysis.actionVerbStrength,
          tailored: analysis.jobMatch?.tailoredSuggestions ?? null,
          experienceGaps: analysis.jobMatch?.experienceGaps ?? null,
          educationMatch: analysis.jobMatch?.educationMatch ?? null,
        },
      },
    });

    return NextResponse.json({ analysisId: savedAnalysis.id });
  } catch (error: any) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}