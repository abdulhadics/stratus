import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const GHL_API_TOKEN = process.env.GHL_DASHBOARD_API_TOKEN;
    
    // Logic: ADMIN sees agency location. USER sees their own location.
    const GHL_LOCATION_ID = session?.user?.role === 'ADMIN' 
      ? process.env.GHL_LOCATION_ID 
      : session?.user?.ghlLocationId;

    if (!GHL_API_TOKEN || !GHL_LOCATION_ID) {
      // If a normal user hasn't linked a GHL account yet, just return empty data (not an error, just no contacts)
      if (session?.user?.role !== 'ADMIN' && !session?.user?.ghlLocationId) {
        return NextResponse.json({ success: true, contacts: [] });
      }
      return NextResponse.json({ error: 'GHL dashboard credentials not configured' }, { status: 500 });
    }

    // GoHighLevel API v2 uses a Bearer token and Version header
    const response = await fetch(`https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&limit=100`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GHL_API_TOKEN}`,
        'Version': '2021-07-28',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GHL Fetch Error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch contacts from GHL' }, { status: response.status });
    }

    const data = await response.json();
    
    // Transform GHL data into a clean structure for the frontend
    const contacts = data.contacts.map((contact: any) => ({
      id: contact.id,
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      email: contact.email || 'No email',
      phone: contact.phone || 'No phone',
      source: contact.source || 'Direct',
      dateAdded: contact.dateAdded ? new Date(contact.dateAdded).toLocaleDateString() : 'Unknown',
      tags: contact.tags || [],
      customFields: contact.customFields || []
    }));

    return NextResponse.json({ success: true, contacts });

  } catch (error: any) {
    console.error('Contacts API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
