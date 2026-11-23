import { NextResponse } from 'next/server';
import { STUDENT_DIRECTORY } from '@/lib/data/studentDirectory';
import { callGeminiWithFallback } from '@/lib/geminiFetch';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { image, enrolledImage, enrolledStudentId, enrolledStudentName } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          faceDetected: false,
          emotion: null,
          confidence: 0,
          error: 'GEMINI_API_KEY is missing in .env.local',
        },
        { status: 500 }
      );
    }

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          faceDetected: false,
          emotion: null,
          confidence: 0,
          error: 'No image frame received from camera',
        },
        { status: 400 }
      );
    }

    // Sanitize base64 payload: strip any data URL prefix
    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');
    const cleanEnrolled = enrolledImage ? enrolledImage.replace(/^data:image\/\w+;base64,/, '') : null;

    const systemPrompt = `You are a precise biometric facial detection, emotion analysis, and identity verification engine.
Analyze Image 1 (the live camera frame).
${cleanEnrolled ? 'Image 2 is the enrolled student reference photo. Compare Image 1 with Image 2 to check if they depict the same person.' : ''}

CRITICAL RULES:
1. If Image 1 is dark, covered, black, blurry, obstructed, or no human face is clearly visible:
   - set faceDetected to false
   - set emotion to null
   - set confidence to 0
   - set matchesEnrolled to false
   Do NOT guess or default to Neutral.

2. Only if a human face is clearly visible in Image 1:
   - set faceDetected to true
   - set emotion to one of: "Happy", "Neutral", "Stressed", "Tired", "Confused"
   - set confidence to a float between 0.60 and 0.99 reflecting facial muscle clarity
   - set matchesEnrolled to ${cleanEnrolled ? 'true if Image 1 and Image 2 show the same individual, otherwise false' : 'false'}

Return raw JSON strictly matching this schema:
{
  "faceDetected": boolean,
  "emotion": "Happy" | "Neutral" | "Stressed" | "Tired" | "Confused" | null,
  "confidence": number,
  "matchesEnrolled": boolean,
  "reason": string
}`;

    const parts: any[] = [
      { text: systemPrompt },
      {
        inline_data: {
          mime_type: 'image/jpeg',
          data: cleanBase64,
        },
      },
    ];

    if (cleanEnrolled) {
      parts.push({
        inline_data: {
          mime_type: 'image/jpeg',
          data: cleanEnrolled,
        },
      });
    }

    const payload = {
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    };

    // Resilient call: gemini-3.5-flash-lite -> 1s retry on 503 -> gemini-3.6-flash on 503/429
    const res = await callGeminiWithFallback(payload);

    // ── RATE LIMIT / QUOTA HANDLING (429) ──
    if (res.status === 429) {
      return NextResponse.json(
        {
          success: false,
          faceDetected: false,
          emotion: null,
          confidence: 0,
          error: 'Daily API quota reached. Please wait a minute or switch to a backup project key.',
        },
        { status: 429 }
      );
    }

    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      return NextResponse.json(
        {
          success: false,
          faceDetected: false,
          emotion: null,
          confidence: 0,
          error: errBody?.error?.message || `Gemini API error ${res.status}`,
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return NextResponse.json(
        {
          success: false,
          faceDetected: false,
          emotion: null,
          confidence: 0,
          error: 'Vision engine analysis failed to return output.',
        },
        { status: 502 }
      );
    }

    // Strip markdown code fences before parsing JSON
    const cleanJson = rawText.replace(/```json|```/g, '').trim();
    const visionResult = JSON.parse(cleanJson);

    // ── STRICT FACE DETECTION CHECK ──
    // If image is dark, covered, or no face is visible -> return 422
    if (!visionResult.faceDetected || !visionResult.emotion) {
      return NextResponse.json(
        {
          success: false,
          faceDetected: false,
          emotion: null,
          confidence: 0,
          reason: visionResult.reason || 'No face visible in frame',
          error: 'No face detected — please position your face inside the camera frame',
        },
        { status: 422 }
      );
    }

    const emotion = visionResult.emotion || 'Neutral';
    const rawConfidence = typeof visionResult.confidence === 'number' ? visionResult.confidence : 0.88;
    const confidencePct = Math.round(rawConfidence > 1 ? rawConfidence : rawConfidence * 100);

    // ── MULTI-USER IDENTITY MATCHING ──
    const isEnrolledMatch = Boolean(visionResult.matchesEnrolled);
    let studentName = 'Guest Student';
    let rollId = 'GUEST-UNVERIFIED';
    let program = 'Unregistered Student • Guest Mode';
    let isGuest = true;

    if (isEnrolledMatch && (enrolledStudentId || enrolledStudentName)) {
      const matchedProfile = enrolledStudentId ? STUDENT_DIRECTORY[enrolledStudentId] : null;
      studentName = matchedProfile?.name || enrolledStudentName || 'Jagadeesh Chinta';
      rollId = matchedProfile?.rollId || enrolledStudentId || '12311668';
      program = matchedProfile?.degree || 'B.Tech CSE, LPU';
      isGuest = false;
    }

    // Dynamic greeting based on identity
    let greeting = '';
    if (!isGuest) {
      const firstName = studentName.split(' ')[0];
      greeting = `Hi ${firstName}! I've scanned your face and you look a bit ${emotion.toLowerCase()} today. What's on your mind?`;
    } else {
      greeting = `Hi there! I see you're looking ${emotion.toLowerCase()} today. Before we dive in, what's your name and what's on your mind?`;
    }

    return NextResponse.json({
      success: true,
      faceDetected: true,
      isGuest,
      studentName,
      rollId,
      program,
      emotion,
      confidence: confidencePct,
      confidenceScore: rawConfidence,
      greeting,
      reason: visionResult.reason,
    });
  } catch (error: any) {
    console.error('Vision auth server error:', error);
    return NextResponse.json(
      {
        success: false,
        faceDetected: false,
        emotion: null,
        confidence: 0,
        error: error?.message || 'Biometric analysis error',
      },
      { status: 500 }
    );
  }
}
