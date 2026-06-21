import { z } from "zod";

export const analyzeSchema = z.object({
  jobDescription: z.string().max(5000, "Job description too long").optional(),
});

export const rewriteSchema = z.object({
  analysisId: z.string().min(1, "Analysis ID is required"),
});

export const downloadSchema = z.object({
  analysisId: z.string().min(1, "Analysis ID is required"),
  rewrites: z.array(
    z.object({
      section: z.string(),
      original: z.string(),
      rewritten: z.string(),
      explanation: z.string(),
    })
  ),
  improvedSummary: z.string().nullable(),
});