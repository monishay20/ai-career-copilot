import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { downloadRatelimit } from "@/lib/ratelimit";
import { downloadSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const { success } = await downloadRatelimit.limit(userId);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes before downloading again." },
        { status: 429 }
      );
    }

    // Validation
    const body = await req.json();
    const parsed = downloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error?.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { analysisId, rewrites, improvedSummary } = parsed.data;

    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      include: { resume: true },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    const { renderToBuffer } = await import("@react-pdf/renderer") as any;
    const { createElement } = await import("react");
    const { default: ResumePDF } = await import("@/components/ResumePDF") as any;

    const pdfBuffer = await renderToBuffer(
      createElement(ResumePDF, {
        fileName: analysis.resume.fileName,
        rawText: analysis.resume.rawText,
        rewrites,
        improvedSummary,
      })
    );

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="optimized-resume.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}