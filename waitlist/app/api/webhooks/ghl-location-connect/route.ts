import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/webhooks/ghl-location-connect
 * 
 * This webhook is called automatically from a GHL Workflow inside the
 * HVAC Snapshot. When admin creates a new sub-account from the snapshot,
 * the workflow fires and sends:
 * - email: the client's email
 * - locationId: the new sub-account's Location ID ({{location.id}})
 * - locationName: the sub-account name ({{location.name}})
 * 
 * This auto-links the client's portal account with their GHL sub-account.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Support multiple field naming conventions from GHL workflows
    const email = body.email || body.contact_email || body.contactEmail;
    const locationId = body.locationId || body.location_id || body.location?.id;
    const locationName = body.locationName || body.location_name || body.location?.name;

    console.log(`[AUTO-LINK] Received location connect webhook:`, { email, locationId, locationName });

    if (!email || !locationId) {
      console.warn('[AUTO-LINK] Missing email or locationId');
      return NextResponse.json({ error: 'email and locationId are required' }, { status: 400 });
    }

    // Find the user in our portal by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.warn(`[AUTO-LINK] No portal user found for ${email}. They may not have purchased yet.`);
      return NextResponse.json({ 
        success: false, 
        message: `No portal account found for ${email}. Account will be linked when they sign up.` 
      });
    }

    // Auto-update their Location ID
    await prisma.user.update({
      where: { email },
      data: { ghlLocationId: locationId },
    });

    console.log(`[AUTO-LINK] ✅ Successfully linked ${email} to Location: ${locationId} (${locationName})`);

    return NextResponse.json({
      success: true,
      message: `Successfully linked ${email} to GHL Location: ${locationName || locationId}`,
      data: { email, locationId, locationName }
    });

  } catch (error: any) {
    console.error('[AUTO-LINK] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
