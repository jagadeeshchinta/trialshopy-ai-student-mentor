import { createUIMessageStreamResponse } from 'ai';
import { callGeminiWithFallback } from '@/lib/geminiFetch';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY is missing in .env.local' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { messages = [], studentData } = body;

    const studentContext = studentData
      ? `Student Profile:
- Name: ${studentData.name || 'Jagadeesh Chinta'}
- Registration Number: ${studentData.registrationNumber || '12311668'}
- University: ${studentData.university || 'Lovely Professional University (LPU)'}
- Degree: ${studentData.degree || 'B.Tech Computer Science and Engineering'}
- Current Semester: ${studentData.currentSemester ?? 7}
- CGPA: ${studentData.currentCgpa ?? 7.5}
- Active Backlogs: ${studentData.activeBacklogs ?? 0}
- Core Strengths: ${Array.isArray(studentData.coreStrengths) ? studentData.coreStrengths.join(', ') : 'DSA, Next.js, Cloud Computing'}
- Areas for Improvement: ${Array.isArray(studentData.areasForImprovement) ? studentData.areasForImprovement.join(', ') : 'Operating Systems, Advanced Computer Networks'}`
      : `Student Profile: Jagadeesh Chinta, B.Tech CSE (LPU), Current CGPA: 7.5, 0 backlogs. Strengths: Data Structures and Algorithms, Next.js, Cloud Computing. Areas for Improvement: Operating Systems, Advanced Computer Networks.`;

    const systemPrompt = `You are an empathetic, human-like AI academic mentor inside a college kiosk. 
You have access to the student's academic data: 
${studentContext}

Act like a supportive teacher. If they ask about their performance, reference their actual data (e.g., praise their 7.5 CGPA or offer help with their specific weak subjects). Keep responses highly concise, conversational, and encouraging. Never output raw JSON or code snippets. Use plain text formatting.`;

    const contents = Array.isArray(messages)
      ? messages.map((m: any) => {
          const role = m.role === 'assistant' ? 'model' : 'user';
          let text = '';
          if (typeof m.content === 'string') {
            text = m.content;
          } else if (Array.isArray(m.parts)) {
            text = m.parts
              .map((p: any) => (typeof p === 'string' ? p : p?.text || ''))
              .join('');
          }
          return {
            role,
            parts: [{ text: text || 'Hello' }],
          };
        })
      : [];

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: contents.length > 0 ? contents : [{ role: 'user', parts: [{ text: 'Hello' }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
      },
    };

    // Resilient call: gemini-3.5-flash-lite -> 1s retry on 503 -> gemini-3.6-flash on 503/429
    const geminiRes = await callGeminiWithFallback(payload, { stream: true });

    if (geminiRes.status === 429) {
      return new Response(
        JSON.stringify({ error: 'Daily API quota reached. Please wait a minute or switch to a backup project key.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!geminiRes.ok) {
      const errBody = await geminiRes.json().catch(() => null);
      return new Response(
        JSON.stringify({ error: errBody?.error?.message || `Gemini API error ${geminiRes.status}` }),
        { status: geminiRes.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!geminiRes.body) {
      return new Response(
        JSON.stringify({ error: 'No response body stream received from Gemini API' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Stream SSE events formatted for Vercel AI SDK useChat
    const reader = geminiRes.body.getReader();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue({ type: 'start' });
        controller.enqueue({ type: 'start-step' });
        controller.enqueue({ type: 'text-start', id: '0' });

        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                const jsonStr = trimmed.slice(6);
                try {
                  const parsed = JSON.parse(jsonStr);
                  const delta = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (delta) {
                    controller.enqueue({ type: 'text-delta', id: '0', delta });
                  }
                } catch (_) {}
              }
            }
          }

          if (buffer.trim().startsWith('data: ')) {
            try {
              const parsed = JSON.parse(buffer.trim().slice(6));
              const delta = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (delta) {
                controller.enqueue({ type: 'text-delta', id: '0', delta });
              }
            } catch (_) {}
          }

          controller.enqueue({ type: 'finish-step' });
          controller.enqueue({ type: 'finish' });
        } catch (err: any) {
          controller.enqueue({ type: 'finish-step' });
          controller.enqueue({ type: 'finish' });
        } finally {
          controller.close();
        }
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return new Response(
      JSON.stringify({ error: err?.message || 'Chat generation failed' }),
      { status: err?.status || 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
