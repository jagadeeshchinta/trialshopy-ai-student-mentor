export interface RoadmapItemData {
  week: number;
  topic: string;
  actionItem: string;
  resourceType: string;
}

export interface MobileRoadmapPayload {
  goal: string;
  studentName: string;
  roadmap: RoadmapItemData[];
}

/**
 * Encodes roadmap data into a compact, URL-safe base64 string
 * with full UTF-8 support for emojis and international characters.
 */
export function encodeRoadmapPayload(payload: MobileRoadmapPayload): string {
  try {
    const jsonStr = JSON.stringify(payload);
    if (typeof window !== 'undefined' && typeof btoa === 'function') {
      const utf8Bytes = new TextEncoder().encode(jsonStr);
      let binary = '';
      for (let i = 0; i < utf8Bytes.length; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
    return Buffer.from(jsonStr, 'utf-8').toString('base64url');
  } catch {
    return encodeURIComponent(JSON.stringify(payload));
  }
}

/**
 * Decodes a URL-safe base64 string back into MobileRoadmapPayload.
 */
export function decodeRoadmapPayload(encoded: string): MobileRoadmapPayload | null {
  if (!encoded || !encoded.trim()) return null;
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    if (typeof window !== 'undefined' && typeof atob === 'function') {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const jsonStr = new TextDecoder().decode(bytes);
      return JSON.parse(jsonStr);
    }
    const jsonStr = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonStr);
  } catch {
    try {
      return JSON.parse(decodeURIComponent(encoded));
    } catch {
      return null;
    }
  }
}

/**
 * Generates the dynamic full URL pointing to `${origin}/mobile-roadmap/${sessionId}?data=${encoded}`
 * with fallback to https://trialshopy-ai-student-mentor.vercel.app during SSR.
 */
export function getShareRoadmapUrl(payload: MobileRoadmapPayload, sessionId = 'live'): string {
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://trialshopy-ai-student-mentor.vercel.app';

  const encoded = encodeRoadmapPayload(payload);
  return `${origin}/mobile-roadmap/${sessionId}?data=${encoded}`;
}
