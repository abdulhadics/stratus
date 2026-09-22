import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Helper to generate a random password
function generatePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, first_name, last_name, contact_id, location_id } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // If no location_id is provided, but we have the Agency API key, auto-create the sub-account
    let finalLocationId = location_id;
    if (!finalLocationId && process.env.GHL_AGENCY_API_KEY) {
      console.log('[GHL] No location_id provided, attempting to create new sub-account...');
      try {
        const createLocRes = await fetch('https://rest.gohighlevel.com/v1/locations/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GHL_AGENCY_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: body.company_name || `${first_name} ${last_name} Business`,
            phone: body.phone || '0000000000',
            email: email,
            firstName: first_name,
            lastName: last_name,
            // Depending on GHL plan, timezone might be required. Providing a default.
            timezone: 'US/Eastern'
          })
        });

        const createLocData = await createLocRes.json();
        if (createLocRes.ok && createLocData.id) {
          finalLocationId = createLocData.id;
          console.log(`[GHL] Successfully created new sub-account with Location ID: ${finalLocationId}`);
        } else {
          console.error('[GHL] Failed to create sub-account via Agency API:', createLocData);
        }
      } catch (agencyErr) {
        console.error('[GHL] Agency API request failed:', agencyErr);
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists but didn't have a location, update it
      if (finalLocationId && !existingUser.ghlLocationId) {
        await prisma.user.update({
          where: { email },
          data: { ghlLocationId: finalLocationId }
        });
      }
      return NextResponse.json({ 
        message: 'User already exists', 
        email: existingUser.email,
        location_id: finalLocationId
      }, { status: 200 });
    }

    // Generate password and hash
    const plainPassword = generatePassword();
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const fullName = [first_name, last_name].filter(Boolean).join(' ') || 'Stratus Client';

    // Create user in DB
    const newUser = await prisma.user.create({
      data: {
        email,
        name: fullName,
        passwordHash,
        ...(finalLocationId ? { ghlLocationId: finalLocationId } : {}),
      },
    });

    // Push the password to GHL Custom Field "Portal Password" (ID: kdaODn5oGg1dgmfHt18p)
    if (contact_id && process.env.GHL_API_TOKEN) {
      try {
        await fetch(`https://services.leadconnectorhq.com/contacts/${contact_id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${process.env.GHL_API_TOKEN}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            customFields: [
              {
                id: 'kdaODn5oGg1dgmfHt18p',
                key: 'contact.portal_password',
                field_value: plainPassword
              }
            ]
          })
        });
        console.log(`[GHL] Successfully updated portal_password for contact ${contact_id}`);
      } catch (ghlErr) {
        console.error('[GHL] Failed to update contact custom field:', ghlErr);
      }
    }

    // Return the generated credentials so GHL or Zapier can send the email
    return NextResponse.json({
      success: true,
      message: 'Credentials generated successfully',
      data: {
        email: newUser.email,
        password: plainPassword,
        login_url: 'https://stratussystems.co/login',
        location_id: finalLocationId
      }
    });

  } catch (error) {
    console.error('[GHL_WEBHOOK_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
