import { GoogleGenAI, Type } from '@google/genai';
import { getGeminiSystemPrompt } from './prompts';
import { ResumeAnalysisSchema } from './schema';
import type { ResumeAnalysis } from '../types';
import type { ParseResult } from './parser';

function resolveApiKey(): string {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.PUBLIC_GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    (import.meta as any).env?.GEMINI_API_KEY,
    (import.meta as any).env?.PUBLIC_GEMINI_API_KEY,
    (import.meta as any).env?.GOOGLE_API_KEY,
  ];

  for (const k of keys) {
    if (typeof k === 'string' && k.trim().length > 0 && k.trim() !== 'your_gemini_api_key_here') {
      return k.trim();
    }
  }

  return '';
}

function cleanJsonResponseText(rawText: string): string {
  if (!rawText) return '';
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isTransientError(err: any): boolean {
  if (!err) return false;
  const status = err?.status || err?.code || err?.error?.code;
  const msg = (err?.message || String(err)).toLowerCase();

  return (
    status === 429 ||
    status === 503 ||
    status === 500 ||
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('500') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('resource_exhausted') ||
    msg.includes('overloaded') ||
    msg.includes('fetch failed') ||
    msg.includes('quota') ||
    msg.includes('temporarily')
  );
}

export function formatUserFacingError(err: any): string {
  if (!err) return 'Unable to analyze resume at this time. Please try again in a few moments.';

  const msg = (typeof err === 'string' ? err : err?.message || String(err)).toLowerCase();

  if (
    msg.includes('missing') ||
    msg.includes('invalid') ||
    msg.includes('unauthorized') ||
    msg.includes('api_key') ||
    msg.includes('api key')
  ) {
    return 'Server configuration issue: AI service key is missing or invalid. Please check your environment configuration.';
  }

  if (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('resource_exhausted') ||
    msg.includes('overloaded') ||
    msg.includes('quota') ||
    msg.includes('temporarily')
  ) {
    return 'The AI engine is currently experiencing high demand. Please try again in a few moments.';
  }

  return 'Unable to analyze resume at this time. Please try again in a few moments.';
}

export async function analyzeResumeWithGemini(
  resumeInput: string | ParseResult,
  targetRole: string,
  personalityId: string = 'tech-recruiter'
): Promise<ResumeAnalysis> {
  const apiKey = resolveApiKey();

  if (!apiKey) {
    throw new Error('AI service key is missing or invalid in server environment.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = getGeminiSystemPrompt(targetRole, personalityId);

  const resumeText = typeof resumeInput === 'string' ? resumeInput : resumeInput.text || '';
  const buffer = typeof resumeInput === 'object' ? resumeInput.buffer : undefined;
  const mimeType = typeof resumeInput === 'object' ? resumeInput.mimeType : undefined;

  const userParts: any[] = [];

  // Pass raw PDF buffer directly for native multimodal document comprehension
  if (mimeType === 'application/pdf' && buffer) {
    userParts.push({
      inlineData: {
        mimeType: 'application/pdf',
        data: buffer.toString('base64'),
      },
    });
    userParts.push({
      text: `TARGET JOB ROLE: ${targetRole || 'General Tech Role'}\n\nPlease audit the uploaded PDF resume above. Extracted text reference:\n${resumeText}`,
    });
  } else {
    userParts.push({
      text: `TARGET JOB ROLE: ${targetRole || 'General Tech Role'}\n\nRESUME CONTENT:\n${resumeText}`,
    });
  }

  const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError: any = null;

  for (const model of candidateModels) {
    const maxRetriesPerModel = 1;
    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: userParts,
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

        const rawResponseText = response.text;
        if (!rawResponseText) {
          throw new Error('Empty response received from AI model.');
        }

        const cleanedText = cleanJsonResponseText(rawResponseText);
        const parsedJson = JSON.parse(cleanedText);
        const validated = ResumeAnalysisSchema.parse(parsedJson);

        return validated as ResumeAnalysis;
      } catch (err: any) {
        lastError = err;
        console.warn(`AI model ${model} attempt ${attempt + 1} failed:`, err?.message || err);

        if (isTransientError(err) && attempt < maxRetriesPerModel) {
          const backoffMs = (attempt + 1) * 1500;
          await sleep(backoffMs);
          continue;
        }

        break;
      }
    }
  }

  throw new Error(formatUserFacingError(lastError));
}

