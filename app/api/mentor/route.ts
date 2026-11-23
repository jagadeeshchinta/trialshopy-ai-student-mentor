import { NextRequest, NextResponse } from 'next/server';
import { callGeminiWithFallback } from '@/lib/geminiFetch';
import type { StudentProfile } from '@/types/kiosk';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface MentorRequestBody {
  messages: ChatMessage[];
  studentProfile?: StudentProfile;
}

// ─── Grounded Mock Fallback Engine ───────────────────────────

function generateMockFallback(
  messages: ChatMessage[],
  student?: StudentProfile
): string {
  const userMessages = messages.filter((m) => m.role === 'user');
  const studentName = student?.fullName || 'Jagadeesh';
  const turnCount = userMessages.length;
  const lastUserText = userMessages[userMessages.length - 1]?.content.toLowerCase() || '';

  // Check user intent from text
  if (
    lastUserText.includes('generate') ||
    lastUserText.includes('roadmap') ||
    lastUserText.includes('yes') ||
    lastUserText.includes('ready')
  ) {
    return (
      `Excellent commitment, ${studentName}! I have drafted your **14-Day Targeted Academic Recovery Roadmap**:\n\n` +
      `• **Phase 1 (Days 1–7): Foundation Repair** — Prioritize completing the pending DFS Traversal lab and mastering BST in-order/pre-order traversal logic.\n` +
      `• **Phase 2 (Days 8–14): Algorithmic Consolidation** — BFS shortest paths, cycle detection, and a full mock retest.\n\n` +
      `Click the **"View & Generate Personalized Roadmap"** button below to explore your step-by-step milestones!`
    );
  }

  if (
    lastUserText.includes('minute') ||
    lastUserText.includes('hour') ||
    lastUserText.includes('time') ||
    lastUserText.includes('45') ||
    lastUserText.includes('60')
  ) {
    return (
      `A commitment of 45 to 60 minutes daily is realistic and well-aligned with your schedule. ` +
      `By focusing your energy during this window exclusively on CSE302, we can methodically recover the 18% deficit from Quiz 2 without disturbing your strong standing in DBMS (84%) and OS (78%).\n\n` +
      `Shall I generate your structured 14-day study roadmap now?`
    );
  }

  if (
    lastUserText.includes('tree') ||
    lastUserText.includes('graph') ||
    lastUserText.includes('dfs') ||
    lastUserText.includes('bfs') ||
    lastUserText.includes('recursion') ||
    lastUserText.includes('pointer') ||
    lastUserText.includes('struggle')
  ) {
    return (
      `Acknowledged. The recursion stack in DFS and tree node pointer manipulation (especially BST deletion with two children) are very common stumbling blocks for CSE students.\n\n` +
      `In CSE302, your Trees and Graphs score dropped to 52% and 44%, respectively. If we isolate recursion templates and work with structured visualizers, this gap can be closed within 14 days.\n\n` +
      `How much focused time can you realistically invest each day outside regular classes? For example: **45 minutes** or **60 minutes** daily?`
    );
  }

  // Turn-based fallback progression
  if (turnCount <= 1) {
    return (
      `Hello ${studentName}. I have reviewed your Semester 6 diagnostic from the LPU academic records.\n\n` +
      `While your **CGPA is 7.5** and you are excelling in **DBMS (84%)** and **Operating Systems (78%)**, your **Data Structures & Algorithms (CSE302)** stands at **64%**, with attendance at 76%.\n\n` +
      `Specifically, **Binary Search Trees (52%)** and **Graph BFS/DFS (44%)** require immediate intervention, alongside the incomplete Week 7 DFS lab.\n\n` +
      `Which area do you feel is currently holding you back the most: **BST traversals & node operations**, or **Graph recursion & traversal implementations**?`
    );
  }

  return (
    `Based on your input, our primary objective is closing the CSE302 knowledge deficit before Week 10 internal assessments. ` +
    `I recommend allocating 45–60 minutes daily for targeted practice. Would you like to proceed with generating your customized 14-day learning roadmap?`
  );
}

// ─── Gemini API Integration ───────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: MentorRequestBody = await req.json();
    const { messages = [], studentProfile } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback if API key is not configured
    if (!apiKey) {
      const mockReply = generateMockFallback(messages, studentProfile);
      return NextResponse.json({
        reply: mockReply,
        source: 'mock_fallback',
        reason: 'GEMINI_API_KEY not configured in environment',
      });
    }

    const studentContext = studentProfile
      ? `Student Name: ${studentProfile.fullName}
University: ${studentProfile.university}
Degree: ${studentProfile.degree}, Semester ${studentProfile.currentSemester}
Roll ID: ${studentProfile.rollId}
CGPA: ${studentProfile.cgpa}
Verified Enrolled Courses:
- Data Structures & Algorithms (CSE302): Overall 64% (Requires Immediate Focus), Attendance: 76%
  Sub-topics: Arrays & Hashing 85% (Proficient), Stacks & Queues 78% (Competent), Binary Search Trees & Traversals 52% (Lagging), Graph Algorithms BFS/DFS 44% (Lagging)
  Evidence: Quiz 2 dropped 18% below student course average; DFS traversal lab recorded as incomplete.
- Operating Systems (CSE316): Overall 78% (On Track), Attendance: 86%
- Database Management Systems (CSE305): Overall 84% (Strong), Attendance: 90%`
      : 'Student: Jagadeesh Chinta, B.Tech CSE Sem 6, CSE302 at 64% (BST 52%, Graphs 44%).';

    const systemPrompt = `You are the Trialshopy AI Smart Student Academic Mentor on a university campus kiosk display.
You are speaking directly with the student in front of a 43-inch touch screen.

CONTEXT DATA:
${studentContext}

STRICT GUIDELINES:
1. Ground all feedback strictly in the student's verified records above. Never invent scores, courses, or emotional states.
2. Maintain an encouraging, professional, and pragmatic academic mentor persona.
3. Keep responses concise (under 120 words), well-structured with clear bullet points, easy to read on a high-resolution display.
4. Follow this 3-stage diagnostic flow:
   - Stage 1: Highlight the flagged subtopics (Trees 52%, Graphs 44%, incomplete DFS lab) and ask what specific concept feels hardest (e.g., recursion, pointers, traversal algorithms).
   - Stage 2: Validate their response and ask for their realistic daily study commitment (e.g., 45 to 60 minutes/day).
   - Stage 3: Propose a targeted 14-day recovery plan and invite them to generate their step-by-step roadmap.
5. Do not use complex markdown that looks messy on a kiosk display. Use simple bolding and clean lists.`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt + '\n\nConversation begins below:' }],
      },
      ...messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    ];

    const payload = {
      contents,
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 500,
      },
    };

    const geminiRes = await callGeminiWithFallback(payload);

    if (geminiRes.status === 429) {
      return NextResponse.json(
        { error: 'Daily API quota reached. Please wait a minute or switch to a backup project key.' },
        { status: 429 }
      );
    }

    if (!geminiRes.ok) {
      console.warn('[Mentor Route] Gemini API call returned non-200, falling back to mock engine.');
      const fallback = generateMockFallback(messages, studentProfile);
      return NextResponse.json({
        reply: fallback,
        source: 'mock_fallback_on_api_error',
      });
    }

    const data = await geminiRes.json();
    const candidateText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!candidateText.trim()) {
      const fallback = generateMockFallback(messages, studentProfile);
      return NextResponse.json({
        reply: fallback,
        source: 'mock_fallback_empty_content',
      });
    }

    return NextResponse.json({
      reply: candidateText.trim(),
      source: 'gemini-3.5-flash-lite',
    });
  } catch (error) {
    console.error('[Mentor Route] Error processing request:', error);
    // Graceful fallback so kiosk never breaks
    const fallback = generateMockFallback([], undefined);
    return NextResponse.json({
      reply: fallback,
      source: 'mock_fallback_exception',
    });
  }
}

