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

  const { name, email, phone, businessName, tradeType, market, offer, language, honeypot } = validation.data;

  // 3. Reject honeypot submissions
  if (honeypot && honeypot.length > 0) {
    return NextResponse.json({ success: true, message: 'Application received.' }, { status: 200 });
  }

  // 4. Build tags
  const normalizedOffer = (offer as string) === 'pipeline' ? 'machine' : offer;
  const baseTags = [
    'src-website-waitlist',
    `lang-${language}`,
    `market-${market}`,
    `trade-${tradeType}`,
    `offer-${normalizedOffer}`,
    `package: ${normalizedOffer}`,
    `package:${normalizedOffer}`,
  ];

  const offerSpecificTags: string[] = [];

  if (normalizedOffer === 'machine') {
    offerSpecificTags.push('offer-machine', 'package: machine', 'package:machine', 'offer-pipeline', 'package: pipeline');
  } else if (normalizedOffer === 'founding') {
    offerSpecificTags.push(
      'package: machine founding',
      'package:machine founding',
      'package: pipeline founding',
      'package:founding',
      'package: founding',
      'offer-founding',
      'offer-machine-founding'
    );
  }

  const tags = Array.from(new Set([...baseTags, ...offerSpecificTags]));

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
