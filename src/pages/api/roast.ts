import type { APIRoute } from 'astro';
import { parseResumeFile } from '../../lib/parser';
import { analyzeResumeWithGemini } from '../../lib/gemini';
import type { RoastApiResponse } from '../../types';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (e: any) {
      const responseBody: RoastApiResponse = {
        success: false,
        error: 'Invalid form request payload. Please ensure you are uploading a valid multipart form.',
      };
      return new Response(JSON.stringify(responseBody), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const file = formData.get('resume') as File | null;
    const rawTargetRole = (formData.get('targetRole') as string) || '';
    const rawPersonalityId = (formData.get('personalityId') as string) || 'tech-recruiter';

    const targetRole = rawTargetRole.trim().slice(0, 100);
    const personalityId = rawPersonalityId.trim() || 'tech-recruiter';

    if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) {
      const responseBody: RoastApiResponse = {
        success: false,
        error: 'No valid resume file provided in request. Please upload a PDF or DOCX file.',
      };
      return new Response(JSON.stringify(responseBody), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Parse File Content with Validation
    const parseResult = await parseResumeFile(file);

    if (parseResult.error || (!parseResult.text && !parseResult.buffer)) {
      const responseBody: RoastApiResponse = {
        success: false,
        error: parseResult.error || 'Failed to parse resume content.',
      };
      return new Response(JSON.stringify(responseBody), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Perform Gemini Structured JSON Analysis
    const analysis = await analyzeResumeWithGemini(parseResult, targetRole, personalityId);

    const responseBody: RoastApiResponse = {
      success: true,
      data: analysis,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in /api/roast:', error);

    const isApiKeyError = error?.message?.includes('GEMINI_API_KEY');
    const userFacingError = isApiKeyError
      ? 'Server configuration issue: GEMINI_API_KEY is missing or invalid. Please check your environment configuration.'
      : error?.message || 'Internal server error while roasting resume.';

    const responseBody: RoastApiResponse = {
      success: false,
      error: userFacingError,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
