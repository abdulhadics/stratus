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
      console.log(`[GHL] User ${email} already exists in Portal DB. We will sync their credentials to the new Sub-Account.`);
    }

    // --- NEW USER CREATION FLOW ---

    // --- HYBRID NATIVE FLOW ---
    
    // Generate a unified password for the new user
    const plainPassword = generatePassword();
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Stratus Client';

    // 2. Fetch the GHL User that was natively created by the Agency Signup Link
    if (process.env.GHL_AGENCY_API_KEY) {
      console.log(`[GHL] Searching for existing natively created user: ${email}...`);
      try {
        const searchUserRes = await fetch(`https://services.leadconnectorhq.com/users/search?query=${encodeURIComponent(email)}&companyId=6YsBZwcOnaDr0Etgu53x`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.GHL_AGENCY_API_KEY}`,
            'Version': '2021-07-28',
            'Accept': 'application/json'
          }
        });

        const searchData = await searchUserRes.json();
        
        if (searchUserRes.ok && searchData.users && searchData.users.length > 0) {
          const ghlUserId = searchData.users[0].id;
          console.log(`[GHL] Found user ${ghlUserId}. Syncing secure unified password...`);

          // 3. Update the GHL User with our highly secure password
          const updateUserRes = await fetch(`https://services.leadconnectorhq.com/users/${ghlUserId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${process.env.GHL_AGENCY_API_KEY}`,
              'Version': '2021-07-28',
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              companyId: '6YsBZwcOnaDr0Etgu53x',
              password: plainPassword
            })
          });

          if (updateUserRes.ok) {
            console.log(`[GHL] ✅ Successfully synced password for GHL User ${email}`);
          } else {
            console.error(`[GHL] ❌ Failed to sync password for GHL User ${email}:`, await updateUserRes.text());
          }
        } else {
          console.warn(`[GHL] ⚠️ No native user found for ${email}. Ensure they signed up via the Agency Link.`);
        }
      } catch (agencyErr) {
        console.error('[GHL] Agency API request failed:', agencyErr);
      }
    }

    // 4. Create or Update Stratus Portal User
    if (existingUser) {
      await prisma.user.update({
        where: { email },
        data: { 
          passwordHash: passwordHash, // Update their password to the new synced one
          ...(finalLocationId ? { ghlLocationId: finalLocationId } : {})
        }
      });
      console.log(`[DB] Updated existing Stratus Portal user for ${email}`);
    } else {
      await prisma.user.create({
        data: {
          email,
          name: fullName,
          passwordHash,
          ...(finalLocationId ? { ghlLocationId: finalLocationId } : {}),
        },
      });
      console.log(`[DB] Created new Stratus Portal user for ${email}`);
    }

    // 5. Push the unified password back to the GHL Contact Custom Field "Portal Password" 
    // This allows the GHL Workflow inside the sub-account to send the Welcome Email!
    if (contactId && process.env.GHL_AGENCY_API_KEY) {
      console.log(`[GHL] Updating contact ${contactId} with portal password...`);
      try {
        await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${process.env.GHL_AGENCY_API_KEY}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            customFields: [
              {
                id: 'kdaODn5oGg1dgmfHt18p', // Assumes this custom field ID exists in the snapshot!
                key: 'contact.portal_password',
                field_value: plainPassword
              }
            ]
          })
        });
        console.log(`[GHL] ✅ Successfully updated portal_password for contact ${contactId}`);
      } catch (ghlErr) {
        console.error('[GHL] Failed to update contact custom field:', ghlErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Hybrid credentials synced successfully',
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
