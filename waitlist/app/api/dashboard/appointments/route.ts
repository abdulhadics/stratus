import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const GHL_API_TOKEN = process.env.GHL_DASHBOARD_API_TOKEN;
    const GHL_LOCATION_ID = (session?.user as any)?.ghlLocationId;

    if (!GHL_API_TOKEN || !GHL_LOCATION_ID) {
      return NextResponse.json({ success: true, events: [] });
    }

    const headers = {
      'Authorization': `Bearer ${GHL_API_TOKEN}`,
      'Version': '2021-07-28',
      'Accept': 'application/json'
    };

    // Fetch upcoming events from today onwards
    const startTime = new Date().getTime();
    
    const res = await fetch(`https://services.leadconnectorhq.com/calendars/events?locationId=${GHL_LOCATION_ID}&startTime=${startTime}`, { 
      headers,
      next: { revalidate: 30 }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch appointments: ${await res.text()}`);
    }
    
    const data = await res.json();
    return NextResponse.json({ success: true, events: data.events || [] });

  } catch (error: any) {
    console.error('Appointments API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
