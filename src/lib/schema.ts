import { z } from 'zod';

export const BulletPointImprovementSchema = z.object({
  original: z.string().default(''),
  improved: z.string().default(''),
});

export const ResumeAnalysisSchema = z.object({
  targetRole: z.string().default('General Role'),
  resumeScore: z.coerce.number().min(0).max(100).default(70),
  atsScore: z.coerce.number().min(0).max(100).default(70),
  verdict: z.string().default('Detailed analysis completed.'),
  roast: z.string().default('Resume analysis generated.'),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  actionableImprovements: z.array(z.string()).default([]),
  betterSummary: z.string().default(''),
  betterBulletPoints: z.array(BulletPointImprovementSchema).default([]),
  missingKeywords: z.array(z.string()).default([]),
  vapiVoiceSummary: z.string().default(''),
});

export type ResumeAnalysisZod = z.infer<typeof ResumeAnalysisSchema>;
