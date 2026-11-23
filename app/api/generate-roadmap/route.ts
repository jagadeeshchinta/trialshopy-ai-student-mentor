import { callGeminiWithFallback } from '@/lib/geminiFetch';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
    if (!apiKey) {
      return Response.json(
        { error: 'GEMINI_API_KEY is missing in .env.local' },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const goal = body.goal || 'Software Development Engineer';
    const weakSubjects = Array.isArray(body.weakSubjects) && body.weakSubjects.length > 0
      ? body.weakSubjects
      : ['Operating Systems', 'Advanced Computer Networks'];

    const weakSubjectsText = weakSubjects.join(', ');

    const prompt = `You are an expert academic planner. Create a 4-week actionable study roadmap for a student who wants to achieve ${goal} but struggles with ${weakSubjectsText}. Keep action items highly specific and concise.`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `${prompt}

Return a strictly valid JSON array of 4 objects matching this schema:
[
  {
    "week": 1,
    "topic": "string",
    "actionItem": "string",
    "resourceType": "YouTube Video" | "Article" | "Interactive Lab" | "Documentation"
  }
]`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    };

    let roadmap = null;

    try {
      // Resilient call: gemini-3.5-flash-lite -> 1s retry on 503 -> gemini-3.6-flash on 503/429
      const res = await callGeminiWithFallback(payload);

      if (res.status === 429) {
        return Response.json(
          { error: 'Daily API quota reached. Please wait a minute or switch to a backup project key.' },
          { status: 429 }
        );
      }

      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleanJson = rawText.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            roadmap = parsed;
          }
        }
      }
    } catch (err: any) {
      console.warn('Roadmap generation error:', err?.message);
    }

    // Graceful curated fallback if temporary offline or parse failure
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
