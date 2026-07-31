import type { APIRoute } from 'astro';
import { parseResumeFile } from '../../lib/parser';
import { analyzeResumeWithGemini } from '../../lib/gemini';
import type { RoastApiResponse } from '../../types';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File | null;
    const targetRole = (formData.get('targetRole') as string) || '';
    const personalityId = (formData.get('personalityId') as string) || 'tech-recruiter';

    if (!file) {
      const responseBody: RoastApiResponse = {
        success: false,
        error: 'No resume file provided in request.',
      };
      return new Response(JSON.stringify(responseBody), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Parse File Content with Validation
    const parseResult = await parseResumeFile(file);

    if (parseResult.error || !parseResult.text) {
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
    const analysis = await analyzeResumeWithGemini(parseResult.text, targetRole, personalityId);

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
    const responseBody: RoastApiResponse = {
      success: false,
      error: error?.message || 'Internal server error while roasting resume.',
    };
    return new Response(JSON.stringify(responseBody), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
