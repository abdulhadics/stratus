import { NextResponse } from 'next/server';

const GHL_API_TOKEN = process.env.GHL_API_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_WAITLIST_PIPELINE_ID = process.env.GHL_WAITLIST_PIPELINE_ID;
const GHL_STAGE_APPLIED_ID = process.env.GHL_STAGE_APPLIED_ID;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, businessName, tradeType, market = 'US', language = 'en' } = body;

    // Extract first name for GHL
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0];

    // 1. Create Contact in GHL
    const contactRes = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_TOKEN}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        firstName: firstName,
        name: fullName,
        email: email,
        phone: phone,
        tags: [
          'src-website-waitlist',
          `lang-${language}`,
          `market-${market}`,
          `trade-${tradeType.toLowerCase()}`,
        ],
        customFields: [
          {
            key: 'business_name',
            field_value: businessName
          }
        ]
      }),
    });

    if (!contactRes.ok) {
      const errorText = await contactRes.text();
      console.error('GHL Contact Creation Failed:', errorText);
      return NextResponse.json({ error: 'Failed to create contact in CRM' }, { status: 500 });
    }

    const contactData = await contactRes.json();
    const contactId = contactData.contact.id;

    // 2. Add Contact to Pipeline/Opportunity
    const oppRes = await fetch('https://services.leadconnectorhq.com/opportunities/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_TOKEN}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        contactId: contactId,
        pipelineId: GHL_WAITLIST_PIPELINE_ID,
        pipelineStageId: GHL_STAGE_APPLIED_ID,
        name: `${fullName} - Waitlist`,
        status: 'open',
      }),
    });

    if (!oppRes.ok) {
      const errorText = await oppRes.text();
      console.error('GHL Opportunity Creation Failed:', errorText);
      // Even if opportunity fails, contact was created successfully
      return NextResponse.json({ error: 'Contact created, but failed to add to pipeline' }, { status: 500 });
    }

    return NextResponse.json({ success: true, contactId });
  } catch (error) {
    console.error('Waitlist API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
