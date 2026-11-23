import { callGeminiWithFallback } from '@/lib/geminiFetch';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userText = body.userText || body.message || '';
    const emotion = body.emotion || 'Neutral';
    const studentName = body.studentName || '';
    const isGuest = Boolean(body.isGuest) || !studentName || studentName === 'Guest Student';

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY is missing in .env.local' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const identityContext = isGuest
      ? `The student is currently in Guest Mode. If they introduced themselves with a name in what they said (e.g., 'I am Priya', 'My name is Alex'), greet them by that name warmly.`
      : `The student is an authenticated enrolled student named ${studentName}.`;

    const systemPrompt = `You are an empathetic campus AI mentor inside a college kiosk. 
${identityContext}
The camera initially thought the student looked ${emotion}. The student just told you: '${userText}'. 
CRITICAL INSTRUCTION: You MUST respond directly to what the student just said. If they introduce themselves, acknowledge their name. If they say the camera was wrong and they are actually happy, apologize playfully and match their happy energy. If they mention a specific problem, address that exact problem. Do not use generic fallback phrases. Keep it to 2 short sentences. Plain text only. No markdown.`;

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          parts: [
            {
              text: `Student input: "${userText}". Detected mood: "${emotion}". Respond in 2 sentences.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 120,
      },
    };

    // Resilient call: gemini-3.5-flash-lite -> 1s retry on 503 -> gemini-3.6-flash on 503/429
    const geminiRes = await callGeminiWithFallback(payload, { stream: true });

    // ── RATE LIMIT / QUOTA HANDLING (429) ──
    if (geminiRes.status === 429) {
      return new Response(
        JSON.stringify({ error: 'Daily API quota reached. Please wait a minute or switch to a backup project key.' }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!geminiRes.ok) {
      const errBody = await geminiRes.json().catch(() => null);
      return new Response(
        JSON.stringify({ error: errBody?.error?.message || `Gemini API error ${geminiRes.status}` }),
        {
          status: geminiRes.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!geminiRes.body) {
      return new Response(
        JSON.stringify({ error: 'No response body stream received from Gemini API' }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Transform Gemini's SSE stream into a clean token-by-token text stream
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new ReadableStream({
      async start(controller) {
        const reader = geminiRes.body!.getReader();
        let buffer = '';
        let hasEmittedTokens = false;

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
                  const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    controller.enqueue(encoder.encode(text));
                    hasEmittedTokens = true;
                  }
                } catch (_) {
                  // Skip invalid JSON chunks
                }
              }
            }
          }

          // Flush any remaining buffer
          if (buffer.trim().startsWith('data: ')) {
            try {
              const parsed = JSON.parse(buffer.trim().slice(6));
              const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                controller.enqueue(encoder.encode(text));
                hasEmittedTokens = true;
              }
            } catch (_) {}
          }

          if (!hasEmittedTokens) {
            controller.enqueue(
              encoder.encode("Sorry, my brain disconnected for a second. Let's head to the dashboard.")
            );
          }
        } catch (err) {
          if (!hasEmittedTokens) {
            controller.enqueue(
              encoder.encode("Sorry, my brain disconnected for a second. Let's head to the dashboard.")
            );
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(transformStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || 'Mentor generation server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
