import { NextResponse } from 'next/server';
import { waitlistSchema } from '@/lib/validations';

// ─── Environment Variables ───
const GHL_API_TOKEN = process.env.GHL_API_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_WAITLIST_PIPELINE_ID = process.env.GHL_WAITLIST_PIPELINE_ID;
const GHL_STAGE_APPLIED_ID = process.env.GHL_STAGE_APPLIED_ID;

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';
const REQUEST_TIMEOUT = 12000;

// ─── Check required env vars ───
function checkConfig(): string | null {
  const missing: string[] = [];
  if (!GHL_API_TOKEN) missing.push('GHL_API_TOKEN');
  if (!GHL_LOCATION_ID) missing.push('GHL_LOCATION_ID');
  if (!GHL_WAITLIST_PIPELINE_ID) missing.push('GHL_WAITLIST_PIPELINE_ID');
  if (!GHL_STAGE_APPLIED_ID) missing.push('GHL_STAGE_APPLIED_ID');
  if (missing.length > 0) {
    console.error(`[STRATUS API] Missing required environment variables: ${missing.join(', ')}`);
    return `Missing configuration: ${missing.join(', ')}`;
  }
  return null;
}

// ─── GHL fetch helper with timeout ───
async function ghlFetch(path: string, body: Record<string, unknown>): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(`${GHL_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_TOKEN}`,
        'Version': GHL_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── GHL Upsert Contact helper ───
async function upsertContact(payload: Record<string, unknown>): Promise<{ ok: boolean; status: number; contactId?: string; errorText?: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    // Primary: Try GHL v2 /contacts/upsert
    let res = await fetch(`${GHL_BASE}/contacts/upsert`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_TOKEN}`,
        'Version': GHL_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    // Fallback: If /contacts/upsert endpoint returns 404, try standard /contacts/
    if (res.status === 404) {
      res = await fetch(`${GHL_BASE}/contacts/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_API_TOKEN}`,
          'Version': GHL_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    }

    if (res.ok) {
      const data = await res.json();
      const contactId = data.contact?.id || data.id;
      return { ok: true, status: res.status, contactId };
    } else {
      const errorText = await res.text().catch(() => 'Unknown error');
      return { ok: false, status: res.status, errorText };
    }
  } catch (err) {
    return { ok: false, status: 500, errorText: err instanceof Error ? err.message : 'Fetch failed' };
  } finally {
    clearTimeout(timeout);
  }
}

// ─── POST Handler ───
export async function POST(request: Request) {
  // 1. Check server configuration
  const configError = checkConfig();
  if (configError) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVICE_CONFIGURATION_ERROR', message: 'Applications are temporarily unavailable.' } },
      { status: 500 }
    );
  }

  // 2. Parse and validate request
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request body.' } },
      { status: 400 }
    );
  }

  const validation = waitlistSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Please check the submitted information.' } },
      { status: 400 }
    );
  }

  const { name, email, phone, businessName, tradeType, market, offer, language, isAvatarGate, honeypot } = validation.data;

  // 3. Reject honeypot submissions
  if (honeypot && honeypot.length > 0) {
    return NextResponse.json({ success: true, message: 'Application received.' }, { status: 200 });
  }

  // 4. Build tags
  const baseTags = [
    'src-website-waitlist',
    `lang-${language}`,
    `market-${market}`,
    `trade-${tradeType}`,
    `offer-${offer}`,
    `package: ${offer}`,
    `package:${offer}`,
  ];

  if (isAvatarGate) {
    baseTags.push('Warm, Self-Verified', 'Warm', 'Self-Verified', 'AI Avatar Gate');
  }

  const tags = Array.from(new Set(baseTags));

  // 5. Parse name parts
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  try {
    // 6. Upsert contact into GHL
    const contactPayload = {
      locationId: GHL_LOCATION_ID,
      firstName,
      ...(lastName && { lastName }),
      name,
      email,
      phone,
      companyName: businessName,
      tags,
      customFields: [
        { key: 'business_name', field_value: businessName },
      ],
    };

    const contactResult = await upsertContact(contactPayload);

    if (!contactResult.ok) {
      console.error('[STRATUS API] GHL Contact upsert failed:', contactResult.status, contactResult.errorText);
      
      // Try again without customFields in case custom field key does not exist in GHL subaccount
      const fallbackPayload = {
        locationId: GHL_LOCATION_ID,
        firstName,
        ...(lastName && { lastName }),
        name,
        email,
        phone,
        companyName: businessName,
        tags,
      };
      
      const retryResult = await upsertContact(fallbackPayload);
      if (!retryResult.ok) {
        console.error('[STRATUS API] GHL Contact fallback failed:', retryResult.status, retryResult.errorText);
        return NextResponse.json(
          { success: false, error: { code: 'CRM_ERROR', message: 'We could not submit your application. Please try again.' } },
          { status: 500 }
        );
      } else {
        contactResult.contactId = retryResult.contactId;
      }
    }

    const contactId = contactResult.contactId;

    // 7. Create opportunity (if contactId exists)
    if (contactId) {
      const oppRes = await ghlFetch('/opportunities/', {
        locationId: GHL_LOCATION_ID,
        contactId,
        pipelineId: GHL_WAITLIST_PIPELINE_ID,
        pipelineStageId: GHL_STAGE_APPLIED_ID,
        name: `${businessName} — Waitlist Application`,
        status: 'open',
      });

      if (!oppRes.ok) {
        const errorText = await oppRes.text().catch(() => 'Unknown error');
        console.warn(`[STRATUS API] Contact ${contactId} created but opportunity failed (${oppRes.status}):`, errorText);
      }
    }

    // 8. Send direct confirmation email if RESEND_API_KEY is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'STRATUS Systems <onboarding@stratusystems.co>',
            to: [email],
            subject: 'Application Received — STRATUS Systems',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #1e3a8a; margin-top: 0;">Application Received!</h2>
                <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hi ${firstName},</p>
                <p style="color: #334155; font-size: 15px; line-height: 1.6;">Thank you for applying for the <strong>STRATUS 6 Systems</strong> platform for <strong>${businessName || 'your business'}</strong>.</p>
                <p style="color: #334155; font-size: 15px; line-height: 1.6;">Our team is reviewing your details. In the meantime, you can explore our system promise and lock in your discovery call.</p>
                <div style="margin: 24px 0; padding: 16px; background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 4px;">
                  <strong style="color: #1e40af;">Status:</strong> <span style="color: #1e3a8a;">Application Pending Review</span>
                </div>
                <p style="color: #64748b; font-size: 13px; border-top: 1px solid #e2e8f0; padding-top: 16px;">STRATUS Systems — Built for Trades & Operations.<br/><a href="https://stratussystems.co" style="color: #2563eb; text-decoration: none;">stratussystems.co</a></p>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.error('[STRATUS API] Direct confirmation email failed:', emailErr);
      }
    }

    return NextResponse.json(
      { success: true, message: 'Application received.' },
      { status: 201 }
    );

  } catch (err) {
    console.error('[STRATUS API] Unexpected error:', err instanceof Error ? err.message : 'Unknown');
    return NextResponse.json(
      { success: false, error: { code: 'CRM_ERROR', message: 'We could not submit your application. Please try again.' } },
      { status: 500 }
    );
  }
}
