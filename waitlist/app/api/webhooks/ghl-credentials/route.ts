import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Helper to generate a random password that meets GHL requirements
function generatePassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';
  const specials = '!@#$%^&*';
  const all = upper + lower + nums + specials;
  
  let password = '';
  password += upper.charAt(Math.floor(Math.random() * upper.length));
  password += lower.charAt(Math.floor(Math.random() * lower.length));
  password += nums.charAt(Math.floor(Math.random() * nums.length));
  password += specials.charAt(Math.floor(Math.random() * specials.length));
  
  for (let i = 0; i < 8; i++) {
    password += all.charAt(Math.floor(Math.random() * all.length));
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
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

    // 1. Check uniqueness: Is this user already in our DB?
    let existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`[GHL] User ${email} already exists. Skipping password generation and account creation.`);
      
      // Update location ID if missing
      if (finalLocationId && !existingUser.ghlLocationId) {
        await prisma.user.update({
          where: { email },
          data: { ghlLocationId: finalLocationId }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'User already exists. No new credentials generated.',
        data: {
          email: email,
          login_url: 'https://stratussystems.co/login',
          location_id: finalLocationId || existingUser.ghlLocationId
        }
      });
    }

    // --- NEW USER CREATION FLOW ---

    // Generate a unified password for the new user
    const plainPassword = generatePassword();
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Stratus Client';

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
            website: 'https://example.com',
            snapshotId: 'zG8duzg1BrVnLLt4ifkg' // Adam Koubi Template (STRATUS HVAC)
          })
        });

        const createLocData = await createLocRes.json();
        if (createLocRes.ok && createLocData.location && createLocData.location.id) {
          finalLocationId = createLocData.location.id;
          console.log(`[GHL] Successfully created new sub-account: ${finalLocationId}`);

          // 4. Create GHL User for this NEW location with the UNIFIED PASSWORD
          console.log(`[GHL] Creating GHL User for NEW location ${finalLocationId}...`);
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
              locationIds: [finalLocationId]  // ONLY the new sub-account, never the template
            })
          });

          const createUserData = await createUserRes.json();
          if (createUserRes.ok) {
            console.log(`[GHL] ✅ Successfully created GHL User for ${email} in location ${finalLocationId}. User ID: ${createUserData?.id}`);
          } else {
            console.error(`[GHL] ❌ Failed to create GHL User for ${email}. Status: ${createUserRes.status}. Error:`, JSON.stringify(createUserData));
          }

        } else {
          console.error('[GHL] Failed to create sub-account:', createLocData);
        }
      } catch (agencyErr) {
        console.error('[GHL] Agency API request failed:', agencyErr);
      }
    }

    // 5. Create Stratus Portal User
    await prisma.user.create({
      data: {
        email,
        name: fullName,
        passwordHash,
        ...(finalLocationId ? { ghlLocationId: finalLocationId } : {}),
      },
    });

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
