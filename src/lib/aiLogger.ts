import { prisma } from "@/lib/prisma";

interface LogAIRequestParams {
  userId: string;
  action: "analyze" | "rewrite" | "download";
  model: string;
  responseTime: number;
  success: boolean;
  errorMessage?: string;
}

export async function logAIRequest({
  userId,
  action,
  model,
  responseTime,
  success,
  errorMessage,
}: LogAIRequestParams) {
  try {
    await prisma.aILog.create({
      data: {
        userId,
        action,
        model,
        responseTime,
        success,
        errorMessage: errorMessage ?? null,
      },
    });
  } catch (error) {
    // Never let logging break the main flow
    console.error("Failed to log AI request:", error);
  }
}