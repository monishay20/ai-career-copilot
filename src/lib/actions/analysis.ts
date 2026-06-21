"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getUserAnalyses() {
  const { userId } = await auth();
  if (!userId) return [];

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) return [];

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    include: {
      analyses: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return resumes;
}

export async function getAnalysisStats() {
  const { userId } = await auth();
  if (!userId) return { total: 0, avgScore: 0, jobMatches: 0 };

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) return { total: 0, avgScore: 0, jobMatches: 0 };

  const analyses = await prisma.analysis.findMany({
    where: { resume: { userId: user.id } },
  });

  const total = analyses.length;
  const avgScore = total > 0
    ? Math.round(analyses.reduce((sum, a) => sum + a.atsScore, 0) / total)
    : 0;
  const jobMatches = analyses.filter((a) => a.matchScore !== null).length;

  return { total, avgScore, jobMatches };
}

export async function getScoreHistory() {
  const { userId } = await auth();
  if (!userId) return [];

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) return [];

  const analyses = await prisma.analysis.findMany({
    where: { resume: { userId: user.id } },
    include: { resume: true },
    orderBy: { createdAt: "asc" },
  });

  return analyses.map((a) => ({
    date: new Date(a.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    atsScore: a.atsScore,
    matchScore: a.matchScore,
    fileName: a.resume.fileName,
  }));
}