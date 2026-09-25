import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * GET /api/admin/ghl-location?email=...&name=...&query=...
 * 
 * Uses the Agency API token to automatically find a client's GHL sub-account.
 * Uses intelligent multi-tier matching:
 * 1. Direct query if supplied
 * 2. Search by company/contact email
 * 3. Search by business name (or first word of name)
 * 4. Fallback: Recent agency sub-accounts so admin can pick the one they just created
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const email = req.nextUrl.searchParams.get('email');
  const name = req.nextUrl.searchParams.get('name');
  const query = req.nextUrl.searchParams.get('query');

  const AGENCY_TOKEN = process.env.GHL_AGENCY_API_KEY;
  const COMPANY_ID = process.env.GHL_COMPANY_ID || '6YsBZwcOnaDr0Etgu53x';

  if (!AGENCY_TOKEN) {
    return NextResponse.json({ error: 'Agency API key not configured' }, { status: 500 });
  }

  const headers = {
    'Authorization': `Bearer ${AGENCY_TOKEN}`,
    'Version': '2021-07-28',
    'Accept': 'application/json',
  };

  try {
    let locations: any[] = [];
    let isRecentFallback = false;

    // 1. Direct search query if provided
    if (query) {
      const res = await fetch(
        `https://services.leadconnectorhq.com/locations/search?companyId=${COMPANY_ID}&query=${encodeURIComponent(query)}`,
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        locations = data.locations || [];
      }
    }

    // 2. Search by email if available and no query result yet
    if (locations.length === 0 && email) {
      const res = await fetch(
        `https://services.leadconnectorhq.com/locations/search?companyId=${COMPANY_ID}&email=${encodeURIComponent(email)}`,
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        locations = data.locations || [];
      }
    }

    // 3. Search by name (and first keyword of name, e.g. "pineapple" from "pineapple express")
    if (locations.length === 0 && name) {
      const res = await fetch(
        `https://services.leadconnectorhq.com/locations/search?companyId=${COMPANY_ID}&query=${encodeURIComponent(name)}`,
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        locations = data.locations || [];
      }

      if (locations.length === 0 && name.includes(' ')) {
        const firstWord = name.split(' ')[0];
        const res2 = await fetch(
          `https://services.leadconnectorhq.com/locations/search?companyId=${COMPANY_ID}&query=${encodeURIComponent(firstWord)}`,
          { headers }
        );
        if (res2.ok) {
          const data2 = await res2.json();
          locations = data2.locations || [];
        }
      }
    }

    // 4. Fallback: Return recent agency sub-accounts so admin can pick the one they just created
    if (locations.length === 0) {
      const res = await fetch(
        `https://services.leadconnectorhq.com/locations/search?companyId=${COMPANY_ID}&limit=12`,
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        locations = data.locations || [];
        isRecentFallback = true;
      }
    }

    return NextResponse.json({
      success: true,
      isRecentFallback,
      locations: locations.map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        email: loc.email,
        phone: loc.phone,
        address: loc.address,
        city: loc.city,
        dateAdded: loc.dateAdded,
      })),
    });

  } catch (error: any) {
    console.error('[GHL Location Search Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
