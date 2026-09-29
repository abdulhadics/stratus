import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find the user in our database
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // We don't strictly need user.ghlLocationId because we are querying the Stratus Internal account.
    // We just ensure the user exists in our DB.
    if (user) {
      const ghlToken = process.env.GHL_API_TOKEN;
      const internalLocationId = process.env.GHL_LOCATION_ID;
      
      if (ghlToken && internalLocationId) {
        const headers = {
          'Authorization': `Bearer ${ghlToken}`,
          'Version': '2021-07-28',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        };

        // 1. Search for the contact by email in GHL using the correct POST endpoint
        const searchRes = await fetch(`https://services.leadconnectorhq.com/contacts/search`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            locationId: internalLocationId,
            filters: [{ field: 'email', operator: 'eq', value: email }],
            pageLimit: 1
          })
        });

        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.contacts && searchData.contacts.length > 0) {
            const contactId = searchData.contacts[0].id;

            // 2. Add the "forgot-password" tag to trigger the standard GHL workflow
            await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/tags`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ tags: ["forgot-password"] })
            }).catch(err => console.error("Error adding tag:", err));
          }
        }
      }
    }

    // Always return success so we don't leak whether an email exists or not
    return NextResponse.json({ success: true, message: 'If an account exists, a recovery email has been sent.' });

  } catch (error) {
    console.error("Forgot password API error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
