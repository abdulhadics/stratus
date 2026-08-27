import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.HEYGEN_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'HEYGEN_API_KEY is not configured in environment variables.',
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const prompt =
      body.prompt ||
      'A male presenter in his 40s dressed in a plain button-down shirt explaining STRATUS 6 Systems operations.';

    // Call HeyGen v3 Video Agent API endpoint
    const res = await fetch('https://api.heygen.com/v3/video-agents', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[STRATUS HEYGEN API] HeyGen API error:', res.status, errorText);
      return NextResponse.json({ success: false, error: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error('[STRATUS HEYGEN API] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
