import { NextResponse } from 'next/server';

const LIVEAVATAR_API_KEY = process.env.LIVEAVATAR_API_KEY || 'e7806c8c-fd26-4de1-b94c-6a64066b0ab9';
const LIVEAVATAR_AVATAR_ID = process.env.LIVEAVATAR_AVATAR_ID || '64b526e4-741c-43b6-a918-4e40f3261c7a';
const LIVEAVATAR_VOICE_ID = process.env.LIVEAVATAR_VOICE_ID || '44783417-501e-42b6-8b24-ede6376c928f';
const LIVEAVATAR_CONTEXT_ID = process.env.LIVEAVATAR_CONTEXT_ID || '78d1c232-6e3e-4488-b0e7-a77891d7c850';
const LIVEAVATAR_API_BASE = 'https://api.liveavatar.com';

// POST /api/liveavatar — Creates a session token then starts the session
export async function POST(request: Request) {
  try {
    if (!LIVEAVATAR_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'LiveAvatar API key not configured.' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const isSandbox = body.sandbox === true;

    // Build session token payload — FULL mode with context_id for full AI pipeline
    // IMPORTANT: Without context_id, avatar runs in "restricted mode" and cannot respond to user input
    const tokenPayload: Record<string, any> = {
      mode: 'FULL',
      avatar_id: isSandbox
        ? 'dd73ea75-1218-4ef3-92ce-606d5f7fbc0a'   // sandbox avatar
        : LIVEAVATAR_AVATAR_ID,
      is_sandbox: isSandbox,
      avatar_persona: {
        voice_id: LIVEAVATAR_VOICE_ID,
        context_id: LIVEAVATAR_CONTEXT_ID,
        language: body.language || 'en',
      },
    };

    console.log('[STRATUS LIVEAVATAR] Creating session token with payload:', JSON.stringify(tokenPayload));

    // Step 1: Create session token
    const tokenRes = await fetch(`${LIVEAVATAR_API_BASE}/v1/sessions/token`, {
      method: 'POST',
      headers: {
        'X-API-KEY': LIVEAVATAR_API_KEY,
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(tokenPayload),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error('[STRATUS LIVEAVATAR] Token creation failed:', tokenRes.status, errorText);
      return NextResponse.json({ success: false, error: errorText }, { status: tokenRes.status });
    }

    const tokenData = await tokenRes.json();
    const { session_id, session_token } = tokenData.data || {};

    if (!session_id || !session_token) {
      console.error('[STRATUS LIVEAVATAR] No session token in response:', JSON.stringify(tokenData));
      return NextResponse.json({ success: false, error: 'No session token received.' }, { status: 500 });
    }

    console.log('[STRATUS LIVEAVATAR] Session token created:', session_id);

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
    console.log('[STRATUS LIVEAVATAR] Session started, livekit_url:', startData.data?.livekit_url ? 'present' : 'MISSING');

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
