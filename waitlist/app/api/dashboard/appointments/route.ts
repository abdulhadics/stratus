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
      return NextResponse.json({ success: true, events: [] });
    }

    const headers = {
      'Authorization': `Bearer ${GHL_API_TOKEN}`,
      'Version': '2021-07-28',
      'Accept': 'application/json'
    };

    // First, fetch calendars for the location
    const calsRes = await fetch(`https://services.leadconnectorhq.com/calendars/?locationId=${GHL_LOCATION_ID}`, { 
      headers,
      next: { revalidate: 30 }
    });
    
    if (!calsRes.ok) {
      throw new Error(`Failed to fetch calendars: ${await calsRes.text()}`);
    }
    
    const calsData = await calsRes.json();
    const calendars = calsData.calendars || [];
    
    if (calendars.length === 0) {
      return NextResponse.json({ success: true, events: [] });
    }

    // Fetch upcoming events from today to 30 days ahead
    const startTime = Date.now().toString();
    const endTime = (Date.now() + 30 * 24 * 60 * 60 * 1000).toString();
    
    let allEvents: any[] = [];
    
    // Fetch events for all calendars
    for (const cal of calendars) {
      const eventsRes = await fetch(`https://services.leadconnectorhq.com/calendars/events?locationId=${GHL_LOCATION_ID}&calendarId=${cal.id}&startTime=${startTime}&endTime=${endTime}`, { 
        headers,
        next: { revalidate: 30 }
      });
      
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        if (eventsData.events) {
          allEvents = [...allEvents, ...eventsData.events];
        }
      }
    }
    
    // Sort events by start time
    allEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    return NextResponse.json({ success: true, events: allEvents });

  } catch (error: any) {
    console.error('Appointments API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
