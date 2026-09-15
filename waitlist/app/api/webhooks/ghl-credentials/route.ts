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
    const { email, first_name, last_name, contact_id } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ 
        message: 'User already exists', 
        email: existingUser.email 
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
        login_url: 'https://stratussystems.co/login'
      }
    });

  } catch (error) {
    console.error('[GHL_WEBHOOK_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
