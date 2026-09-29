import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const webhookUrl = process.env.GHL_FORGOT_PASSWORD_WEBHOOK;
    
    if (webhookUrl) {
      // Send the email to the GHL webhook to trigger the workflow
      // The workflow should look up the contact by email and send them their password custom field
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(err => console.error("Webhook error:", err));
    }

    // Always return success so we don't leak whether an email exists or not
    return NextResponse.json({ success: true, message: 'If an account exists, a recovery email has been sent.' });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
