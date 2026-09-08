import { NextResponse } from 'next/server';

const LIVEAVATAR_API_KEY = process.env.LIVEAVATAR_API_KEY || 'e7806c8c-fd26-4de1-b94c-6a64066b0ab9';
const LIVEAVATAR_AVATAR_ID = process.env.LIVEAVATAR_AVATAR_ID || '64b526e4-741c-43b6-a918-4e40f3261c7a';
const LIVEAVATAR_API_BASE = 'https://api.liveavatar.com';

// Step 1: Create a session token
export async function POST(request: Request) {
  try {
    if (!LIVEAVATAR_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'LiveAvatar API key not configured.' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));

    // Create session token via LiveAvatar API
    const tokenRes = await fetch(`${LIVEAVATAR_API_BASE}/v1/sessions/token`, {
      method: 'POST',
      headers: {
        'X-API-KEY': LIVEAVATAR_API_KEY,
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        mode: body.mode || 'LITE',
        avatar_id: body.sandbox === true ? 'dd73ea75-1218-4ef3-92ce-606d5f7fbc0a' : LIVEAVATAR_AVATAR_ID,
        is_sandbox: body.sandbox === true,
        ...(body.mode === 'FULL' && {
          avatar_persona: {
            ...(process.env.LIVEAVATAR_VOICE_ID ? { voice_id: process.env.LIVEAVATAR_VOICE_ID } : {}),
            ...(body.voice_id ? { voice_id: body.voice_id } : {}),
            ...(body.context_id ? { context_id: body.context_id } : {}),
            language: body.language || 'en',
            prompt: `You are John, the AI assistant for STRATUS — a premium operations platform built specifically for trade business owners (HVAC, plumbing, electrical, roofing, etc.).

# TONE & PERSONA
- You talk like a fellow business owner who gets it. Direct, warm, and real.
- No corporate fluff, no "AI-sounding" filler, and NEVER use robotic phrases like "That's a great question."
- If a user just says "hi", "hello", or greets you, reply naturally with a warm greeting and ask how you can help them streamline their operations.

# ABOUT STRATUS
- We help trade business owners go from "doing everything themselves" to running a self-operating business (Level 5 Operations).
- We build and install 6 automated systems into their business (CRM, follow-ups, missed call text-back, review requests, appointment reminders, and lead nurturing) — done-for-you in 7 days.
- Packages:
  1. Presence: Systems 1-4 (great for getting the digital foundation locked in).
  2. Machine: All 6 systems (the full engine that runs ops while they focus on growth).
- Pricing/Action: 50% refundable deposit to lock in a build slot. 30-day satisfaction guarantee on the monthly fee.

# CORE RULES
1. BILINGUAL: Always reply in the exact same language the user writes in (English or French). Never mix them.
2. CONCISE: Keep answers tight — 1 to 3 sentences max. Entrepreneurs don't have time to read essays.
3. DIRECT: Answer the question directly without repetitive filler openings.
4. SCOPE: Don't invent features. Stick to what STRATUS actually offers.
5. CALL TO ACTION: If they ask about complex pricing or features, give a brief answer and tell them to book a free 30-min discovery call.

The user just asked you: "${body.question || 'Hello'}". Answer their question directly and concisely.`
          },
        }),
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error('[STRATUS LIVEAVATAR] Token creation failed:', tokenRes.status, errorText);
      return NextResponse.json({ success: false, error: errorText }, { status: tokenRes.status });
    }

    const tokenData = await tokenRes.json();
    const { session_id, session_token } = tokenData.data || {};

    if (!session_id || !session_token) {
      return NextResponse.json({ success: false, error: 'No session token received.' }, { status: 500 });
    }

    // Step 2: Start the session to get LiveKit credentials
    const startRes = await fetch(`${LIVEAVATAR_API_BASE}/v1/sessions/start`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'authorization': `Bearer ${session_token}`,
      },
    });

    if (!startRes.ok) {
      const errorText = await startRes.text();
      console.error('[STRATUS LIVEAVATAR] Session start failed:', startRes.status, errorText);
      return NextResponse.json({ success: false, error: errorText }, { status: startRes.status });
    }

    const startData = await startRes.json();

    return NextResponse.json({
      success: true,
      data: {
        session_id,
        session_token,
        livekit_url: startData.data?.livekit_url,
        livekit_client_token: startData.data?.livekit_client_token,
      },
    });
  } catch (err) {
    console.error('[STRATUS LIVEAVATAR] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
