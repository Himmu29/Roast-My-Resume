import { z } from 'zod';

export const BulletPointImprovementSchema = z.object({
  original: z.string(),
  improved: z.string(),
});

export const ResumeAnalysisSchema = z.object({
  targetRole: z.string(),
  resumeScore: z.number().min(0).max(100),
  atsScore: z.number().min(0).max(100),
  verdict: z.string(),
  roast: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  actionableImprovements: z.array(z.string()),
  betterSummary: z.string(),
  betterBulletPoints: z.array(BulletPointImprovementSchema),
  missingKeywords: z.array(z.string()),
  vapiVoiceSummary: z.string(),
});

export type ResumeAnalysisZod = z.infer<typeof ResumeAnalysisSchema>;
