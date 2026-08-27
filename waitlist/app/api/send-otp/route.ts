import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, name, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, error: 'Email and code are required' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      // Send real email via Resend API
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'STRATUS Verification <verify@stratusystems.co>',
          to: [email],
          subject: `${code} is your STRATUS verification code`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 8px;">
              <h2 style="color: #2563EB; margin-bottom: 8px;">STRATUS Verification Code</h2>
              <p style="color: #475569; font-size: 14px;">Hi ${name || 'there'},</p>
              <p style="color: #475569; font-size: 14px;">Your 6-digit verification code to unlock access to the STRATUS AI Avatar assistant is:</p>
              <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a;">${code}</span>
              </div>
              <p style="color: #94a3b8; font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
            </div>
          `,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('[STRATUS OTP] Resend API error:', errorText);
      }
    } else {
      console.log(`[STRATUS OTP DEMO] Code for ${email}: ${code} (Set RESEND_API_KEY for real email delivery)`);
    }

    return NextResponse.json({ success: true, message: 'Verification code generated.' }, { status: 200 });
  } catch (err) {
    console.error('[STRATUS OTP] Unexpected error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
