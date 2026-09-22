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
    const email = body.email;
    const firstName = body.first_name || body.firstName;
    const lastName = body.last_name || body.lastName;
    const contactId = body.contact_id || body.contactId || body.id;
    let finalLocationId = body.location_id || body.locationId;
    const phone = body.phone;
    const companyName = body.company_name || body.companyName;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate a unified password right away
    const plainPassword = generatePassword();
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Stratus Client';

    // 1. Check uniqueness: Is this user already in our DB?
    let existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // 2. If user exists and ALREADY has a location, skip creating a new one (prevents duplicate locations)
    if (existingUser && existingUser.ghlLocationId) {
      finalLocationId = existingUser.ghlLocationId;
      console.log(`[GHL] User ${email} already exists and has location ${finalLocationId}. Skipping location creation.`);
    } else {
      // 3. Create GHL Location if needed
      if (!finalLocationId && process.env.GHL_AGENCY_API_KEY) {
        console.log('[GHL] Creating new sub-account...');
        try {
          const createLocRes = await fetch('https://services.leadconnectorhq.com/locations/', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.GHL_AGENCY_API_KEY}`,
              'Version': '2021-07-28',
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              companyId: '6YsBZwcOnaDr0Etgu53x',
              name: companyName || `${firstName} ${lastName} Business`,
              phone: phone || '+10000000000',
              email: email,
              firstName: firstName,
              lastName: lastName,
              timezone: 'US/Eastern',
              address: 'TBD',
              city: 'TBD',
              state: 'TBD',
              country: 'US',
              postalCode: '00000',
              website: 'https://example.com'
            })
          });

          const createLocData = await createLocRes.json();
          if (createLocRes.ok && createLocData.location && createLocData.location.id) {
            finalLocationId = createLocData.location.id;
            console.log(`[GHL] Successfully created new sub-account: ${finalLocationId}`);

            // 4. Create GHL User for this location with the UNIFIED PASSWORD
            console.log('[GHL] Attempting to create GHL User for the new location...');
            const createUserRes = await fetch('https://services.leadconnectorhq.com/users/', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.GHL_AGENCY_API_KEY}`,
                'Version': '2021-07-28',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                companyId: '6YsBZwcOnaDr0Etgu53x',
                firstName: firstName || 'Stratus',
                lastName: lastName || 'Client',
                email: email,
                password: plainPassword,
                type: 'account',
                role: 'admin',
                locationIds: [finalLocationId]
              })
            });

            if (createUserRes.ok) {
              console.log(`[GHL] Successfully created GHL User for ${email}`);
            } else {
              const createUserData = await createUserRes.json();
              console.error('[GHL] Failed to create GHL User (Might already exist):', createUserData);
            }

          } else {
            console.error('[GHL] Failed to create sub-account:', createLocData);
          }
        } catch (agencyErr) {
          console.error('[GHL] Agency API request failed:', agencyErr);
        }
      }
    }

    // 5. Update or Create Stratus Portal User
    if (existingUser) {
      if (finalLocationId && !existingUser.ghlLocationId) {
        await prisma.user.update({
          where: { email },
          data: { ghlLocationId: finalLocationId }
        });
      }
    } else {
      await prisma.user.create({
        data: {
          email,
          name: fullName,
          passwordHash,
          ...(finalLocationId ? { ghlLocationId: finalLocationId } : {}),
        },
      });
    }

    // 6. Push the unified password back to the GHL Custom Field "Portal Password" (Internal Account)
    if (contactId && process.env.GHL_API_TOKEN) {
      try {
        await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
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
        console.log(`[GHL] Successfully updated portal_password for contact ${contactId}`);
      } catch (ghlErr) {
        console.error('[GHL] Failed to update contact custom field:', ghlErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Credentials generated successfully',
      data: {
        email: email,
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
