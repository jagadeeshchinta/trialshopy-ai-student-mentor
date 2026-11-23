import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';

export const runtime = 'edge';

const MODEL_NAME = 'gemini-3.5-flash-lite';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY is missing in .env.local' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const google = createGoogleGenerativeAI({
      apiKey,
    });

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

    // Normalize messages to UI Message structure with parts
    const normalizedMessages = Array.isArray(messages)
      ? messages.map((m: any, index: number) => ({
          id: m.id || `msg-${index}-${Date.now()}`,
          role: m.role || 'user',
          parts: Array.isArray(m.parts) && m.parts.length > 0
            ? m.parts
            : [{ type: 'text', text: typeof m.content === 'string' ? m.content : '' }],
        }))
      : [];

    const modelMessages = await convertToModelMessages(normalizedMessages);

    // Strictly locked to gemini-3.5-flash-lite
    const result = streamText({
      model: google(MODEL_NAME),
      system: systemPrompt,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (err: any) {
    console.error('Chat API Error:', err);
    const is429 = err?.status === 429 || err?.statusCode === 429 || (typeof err?.message === 'string' && err.message.includes('429'));
    if (is429) {
      return new Response(
        JSON.stringify({ error: 'Daily API quota reached. Please wait a minute or switch to a backup project key.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ error: err?.message || 'Chat generation failed' }),
      { status: err?.status || 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
