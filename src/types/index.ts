export interface BulletPointImprovement {
  original: string;
  improved: string;
}

export interface ResumeAnalysis {
  targetRole: string;
  resumeScore: number;
  atsScore: number;
  verdict: string;
  roast: string;
  strengths: string[];
  weaknesses: string[];
  actionableImprovements: string[];
  betterSummary: string;
  betterBulletPoints: BulletPointImprovement[];
  missingKeywords: string[];
  vapiVoiceSummary: string;
}

export interface RoastApiResponse {
  success: boolean;
  data?: ResumeAnalysis;
  error?: string;
}

export interface PersonalityOption {
  id: string;
  name: string;
  description: string;
}
