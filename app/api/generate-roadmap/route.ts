import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export const runtime = 'edge';

const MODEL_NAME = 'gemini-3.5-flash-lite';

// Zod schema for expected 4-week study roadmap output
export const roadmapItemSchema = z.object({
  week: z.number().describe('Week number from 1 to 4'),
  topic: z.string().describe('Key technical topic or foundational concept for the week'),
  actionItem: z.string().describe('Specific, concise, hands-on task to complete'),
  resourceType: z.string().describe('Recommended learning resource type e.g. YouTube Video, Article, Lab, Documentation'),
});

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
    if (!apiKey) {
      return Response.json(
        { error: 'GEMINI_API_KEY is missing in .env.local' },
        { status: 500 }
      );
    }

    const google = createGoogleGenerativeAI({
      apiKey,
    });

    const body = await req.json().catch(() => ({}));
    const goal = body.goal || 'Software Development Engineer';
    const weakSubjects = Array.isArray(body.weakSubjects) && body.weakSubjects.length > 0
      ? body.weakSubjects
      : ['Operating Systems', 'Advanced Computer Networks'];

    const weakSubjectsText = weakSubjects.join(', ');

    const prompt = `You are an expert academic planner. Create a 4-week actionable study roadmap for a student who wants to achieve ${goal} but struggles with ${weakSubjectsText}. Keep action items highly specific and concise.`;

    let roadmap = null;

    try {
      // Strictly locked to gemini-3.5-flash-lite
      const result = await generateObject({
        model: google(MODEL_NAME),
        output: 'array',
        schema: roadmapItemSchema,
        prompt,
      });

      if (Array.isArray(result.object) && result.object.length > 0) {
        roadmap = result.object;
      }
    } catch (err: any) {
      console.warn(`Model ${MODEL_NAME} call error:`, err?.message);
      const is429 = err?.status === 429 || err?.statusCode === 429 || (typeof err?.message === 'string' && err.message.includes('429'));
      if (is429) {
        return Response.json(
          { error: 'Daily API quota reached. Please wait a minute or switch to a backup project key.' },
          { status: 429 }
        );
      }
    }

    // Graceful offline fallback if temporary network/service issue
    if (!roadmap || !Array.isArray(roadmap) || roadmap.length === 0) {
      roadmap = [
        {
          week: 1,
          topic: `Core Fundamentals of ${weakSubjects[0] || 'System Architecture'}`,
          actionItem: 'Study Process Control Blocks, CPU Scheduling algorithms, and draw thread lifecycle states.',
          resourceType: 'YouTube Video',
        },
        {
          week: 2,
          topic: 'Memory Management, Paging & Concurrency',
          actionItem: 'Implement a virtual memory page replacement simulator and solve 3 deadlock prevention problems.',
          resourceType: 'Interactive Lab',
        },
        {
          week: 3,
          topic: `${weakSubjects[1] || 'Network Protocols'} & System Design`,
          actionItem: 'Analyze TCP/UDP socket connections, OSI layers, and debug live packet flows via Wireshark.',
          resourceType: 'Article',
        },
        {
          week: 4,
          topic: `${goal} Placement Capstone & Mock Drills`,
          actionItem: 'Build an end-to-end multi-threaded server application and solve 15 targeted interview questions.',
          resourceType: 'Documentation',
        },
      ];
    }

    return Response.json(roadmap);
  } catch (error: any) {
    console.error('Error generating roadmap:', error);
    const is429 = error?.status === 429 || error?.statusCode === 429 || (typeof error?.message === 'string' && error.message.includes('429'));
    if (is429) {
      return Response.json(
        { error: 'Daily API quota reached. Please wait a minute or switch to a backup project key.' },
        { status: 429 }
      );
    }
    return Response.json(
      { error: error?.message || 'Failed to generate study roadmap' },
      { status: error?.status || 500 }
    );
  }
}
