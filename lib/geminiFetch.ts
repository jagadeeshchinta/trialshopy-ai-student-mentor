export interface GeminiCallOptions {
  stream?: boolean;
  apiKey?: string;
  timeoutMs?: number;
}

/**
 * Shared helper that executes a Gemini generateContent or streamGenerateContent
 * call with resilient retry and priority model fallback.
 *
 * Priority Order:
 * 1) gemini-3.5-flash-lite (attempt 1)
 * 2) gemini-3.5-flash-lite (attempt 2 after a short 1000ms delay if attempt 1 returned HTTP 503)
 * 3) gemini-3.6-flash (fallback only if gemini-3.5-flash-lite still returns 503 or 429)
 *
 * Constraints:
 * - Do NOT fall back on HTTP 400 or 401 errors.
 * - Only retry/fallback on 503 (high demand) or 429 (rate limit).
 */
export async function callGeminiWithFallback(
  payload: Record<string, any>,
  options: GeminiCallOptions = {}
): Promise<Response> {
  const apiKey =
    options.apiKey ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    '';

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY is missing in .env.local' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const isStream = Boolean(options.stream || payload.stream);
  const bodyPayload = { ...payload };
  delete bodyPayload.stream;

  const timeoutMs = options.timeoutMs || 25000;

  const makeCall = async (model: string): Promise<Response> => {
    const action = isStream ? 'streamGenerateContent?alt=sse' : 'generateContent';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${action}`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(bodyPayload),
      signal: AbortSignal.timeout(timeoutMs),
    });
  };

  // ── Attempt 1: gemini-3.5-flash-lite ──
  let res: Response;
  try {
    res = await makeCall('gemini-3.5-flash-lite');
  } catch (err: any) {
    console.warn('[callGeminiWithFallback] Attempt 1 error on gemini-3.5-flash-lite:', err?.message);
    await new Promise((r) => setTimeout(r, 1000));
    try {
      res = await makeCall('gemini-3.5-flash-lite');
    } catch {
      return makeCall('gemini-3.6-flash');
    }
  }

  // If successful (200-299), return immediately
  if (res.ok) {
    return res;
  }

  // CRITICAL: Do NOT fall back on HTTP 400 or 401 errors
  if (res.status === 400 || res.status === 401) {
    return res;
  }

  // ── Attempt 2: Retry gemini-3.5-flash-lite after 1000ms if attempt 1 returned HTTP 503 ──
  if (res.status === 503) {
    console.warn('[callGeminiWithFallback] gemini-3.5-flash-lite returned 503 (high demand). Retrying in 1000ms...');
    await new Promise((r) => setTimeout(r, 1000));
    try {
      res = await makeCall('gemini-3.5-flash-lite');
      if (res.ok) {
        return res;
      }
      if (res.status === 400 || res.status === 401) {
        return res;
      }
    } catch (err: any) {
      console.warn('[callGeminiWithFallback] Attempt 2 exception on gemini-3.5-flash-lite:', err?.message);
    }
  }

  // ── Fallback: If gemini-3.5-flash-lite still returns 503 or 429, fall back to gemini-3.6-flash ──
  if (res.status === 503 || res.status === 429) {
    console.warn(`[callGeminiWithFallback] Falling back to gemini-3.6-flash due to HTTP ${res.status}...`);
    try {
      const fallbackRes = await makeCall('gemini-3.6-flash');
      return fallbackRes;
    } catch (err: any) {
      console.error('[callGeminiWithFallback] Fallback gemini-3.6-flash exception:', err?.message);
      return res;
    }
  }

  return res;
}
