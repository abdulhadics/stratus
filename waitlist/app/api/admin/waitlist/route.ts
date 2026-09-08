import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only admins can access the waitlist
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const GHL_API_TOKEN = process.env.GHL_DASHBOARD_API_TOKEN;
    const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

    if (!GHL_API_TOKEN || !GHL_LOCATION_ID) {
      return NextResponse.json({ error: 'Stratus internal GHL credentials not configured' }, { status: 500 });
    }

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
      console.error('GHL Fetch Error (Admin Waitlist):', errorText);
      return NextResponse.json({ error: 'Failed to fetch waitlist from GHL' }, { status: response.status });
    }

    const data = await response.json();
    
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
    console.error('Admin Waitlist API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
