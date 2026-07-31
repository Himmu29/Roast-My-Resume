import { GoogleGenAI, Type } from '@google/genai';
import { getGeminiSystemPrompt } from './prompts';
import { ResumeAnalysisSchema } from './schema';
import type { ResumeAnalysis } from '../types';

export async function analyzeResumeWithGemini(
  resumeText: string,
  targetRole: string,
  personalityId: string = 'tech-recruiter'
): Promise<ResumeAnalysis> {
  const apiKey =
    (import.meta as any).env?.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.PUBLIC_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY environment variable is missing or invalid in .env file.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = getGeminiSystemPrompt(targetRole, personalityId);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `TARGET JOB ROLE: ${targetRole || 'General Tech Role'}\n\nRESUME CONTENT:\n${resumeText}`,
          },
        ],
      },
    ],
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          targetRole: { type: Type.STRING },
          resumeScore: { type: Type.INTEGER },
          atsScore: { type: Type.INTEGER },
          verdict: { type: Type.STRING },
          roast: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          actionableImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
          betterSummary: { type: Type.STRING },
          betterBulletPoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                improved: { type: Type.STRING },
              },
              required: ['original', 'improved'],
            },
          },
          missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          vapiVoiceSummary: { type: Type.STRING },
        },
        required: [
          'targetRole',
          'resumeScore',
          'atsScore',
          'verdict',
          'roast',
          'strengths',
          'weaknesses',
          'actionableImprovements',
          'betterSummary',
          'betterBulletPoints',
          'missingKeywords',
          'vapiVoiceSummary',
        ],
      },
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error('Empty response received from Gemini API.');
  }

  const parsedJson = JSON.parse(responseText);
  const validated = ResumeAnalysisSchema.parse(parsedJson);

  return validated as ResumeAnalysis;
}
