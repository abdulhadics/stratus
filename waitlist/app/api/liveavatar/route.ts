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
        mode: 'FULL',
        avatar_id: LIVEAVATAR_AVATAR_ID,
        is_sandbox: body.sandbox === true,
        avatar_persona: {
          ...(process.env.LIVEAVATAR_VOICE_ID ? { voice_id: process.env.LIVEAVATAR_VOICE_ID } : {}),
          ...(body.voice_id ? { voice_id: body.voice_id } : {}),
          ...(body.context_id ? { context_id: body.context_id } : {}),
          language: body.language || 'en',
        },
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
