import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Use user's own sub-account token, fallback to env default (for admin)
    const GHL_API_TOKEN = (session?.user as any)?.ghlApiToken || process.env.GHL_DASHBOARD_API_TOKEN;
    const GHL_LOCATION_ID = (session?.user as any)?.ghlLocationId;

    if (!GHL_API_TOKEN || !GHL_LOCATION_ID) {
      return NextResponse.json({ success: true, conversations: [] });
    }

    const headers = {
      'Authorization': `Bearer ${GHL_API_TOKEN}`,
      'Version': '2021-07-28',
      'Accept': 'application/json'
    };

    const res = await fetch(`https://services.leadconnectorhq.com/conversations/search?locationId=${GHL_LOCATION_ID}&limit=20`, { 
      headers,
      next: { revalidate: 30 }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch conversations: ${await res.text()}`);
    }
    
    const data = await res.json();
    return NextResponse.json({ success: true, conversations: data.conversations || [] });

  } catch (error: any) {
    console.error('Conversations API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
