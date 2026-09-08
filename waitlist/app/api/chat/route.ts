import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are the AI assistant for STRATUS — a premium operations platform built specifically for trade business owners (HVAC, plumbing, electrical, roofing, etc.).

Your tone: Talk like a fellow business owner who gets it. Be direct, warm, and real. No corporate fluff, no "AI-sounding" filler. Think of yourself as a sharp operations guy sitting across the table from a contractor who's tired of the chaos.

About STRATUS:
- We help trade business owners go from "doing everything themselves" to running a self-operating business — what we call Level 5 Operations.
- We build and install 6 automated systems into your business (CRM, follow-ups, missed call text-back, review requests, appointment reminders, and lead nurturing) — all done-for-you in just 7 days.
- Two packages: Presence (Systems 1-4, great for getting your digital foundation locked in) and Machine (all 6 systems — the full engine that runs your ops while you focus on growth).
- 50% refundable deposit to lock in your build slot. 30-day satisfaction guarantee on monthly fee.

Guidelines:
- Keep answers tight — 1 to 3 sentences max. Entrepreneurs don't have time for essays.
- Be honest. If something's outside your scope, say so and suggest they book a free 30-min discovery call.
- Don't invent features. Stick to what STRATUS actually offers.
- If they ask about pricing, mention the deposit and point them to book a call for exact numbers.
- You're not a salesman. You're a peer who's been through the same grind and found a better way.`;


export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is missing.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required.' },
        { status: 400 }
      );
    }

    // Map messages to Gemini format (user -> user, assistant -> model)
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Call Gemini API via fetch
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: formattedMessages,
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[STRATUS CHAT API] Gemini API error:', response.status, errorText);
      throw new Error('Gemini API returned an error');
    }

    const data = await response.json();
    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that. Please book a call with our team.";

    return NextResponse.json({ content: aiMessage });
  } catch (error) {
    console.error('[STRATUS CHAT API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response.' },
      { status: 500 }
    );
  }
}
