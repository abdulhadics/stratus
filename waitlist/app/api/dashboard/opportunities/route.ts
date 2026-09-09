import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Client Portal ONLY uses the user's specific location ID and API Token.
    const GHL_API_TOKEN = session?.user?.ghlApiToken;
    const GHL_LOCATION_ID = session?.user?.ghlLocationId;

    if (!GHL_API_TOKEN || !GHL_LOCATION_ID) {
      return NextResponse.json({ success: true, pipelineName: 'No Account Linked', stages: [] });
    }

    const headers = {
      'Authorization': `Bearer ${GHL_API_TOKEN}`,
      'Version': '2021-07-28',
      'Accept': 'application/json'
    };

    // 1. Fetch Pipelines (to get stages)
    const pipelineRes = await fetch(`https://services.leadconnectorhq.com/opportunities/pipelines?locationId=${GHL_LOCATION_ID}`, { headers });
    
    if (!pipelineRes.ok) {
      throw new Error(`Failed to fetch pipelines: ${await pipelineRes.text()}`);
    }
    
    const pipelineData = await pipelineRes.json();
    const pipelines = pipelineData.pipelines || [];
    
    // Default to the first pipeline (usually the main one)
    const activePipeline = pipelines[0];
    
    if (!activePipeline) {
      return NextResponse.json({ success: true, pipeline: null, opportunities: [] });
    }

    // 2. Fetch Opportunities for this location
    const oppsRes = await fetch(`https://services.leadconnectorhq.com/opportunities/search?location_id=${GHL_LOCATION_ID}`, { headers });
    
    if (!oppsRes.ok) {
      throw new Error(`Failed to fetch opportunities: ${await oppsRes.text()}`);
    }
    
    const oppsData = await oppsRes.json();
    const opportunities = oppsData.opportunities || [];

    // 3. Format stages and group opportunities for easy Kanban rendering
    const stages = activePipeline.stages.sort((a: any, b: any) => a.position - b.position).map((stage: any) => ({
      id: stage.id,
      name: stage.name,
      color: stage.color,
      opportunities: opportunities.filter((opp: any) => opp.pipelineStageId === stage.id).map((opp: any) => ({
        id: opp.id,
        name: opp.name || opp.contact?.name || 'Unknown Contact',
        email: opp.contact?.email,
        phone: opp.contact?.phone,
        status: opp.status,
        value: opp.monetaryValue,
        createdAt: opp.createdAt
      }))
    }));

    return NextResponse.json({ 
      success: true, 
      pipelineName: activePipeline.name,
      stages 
    });

  } catch (error: any) {
    console.error('Opportunities API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
