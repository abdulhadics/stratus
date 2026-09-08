import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are John, the AI assistant for STRATUS — a premium operations platform built specifically for trade business owners (HVAC, plumbing, electrical, roofing, etc.).

# TONE & PERSONA
- You talk like a fellow business owner who gets it. Direct, warm, and real.
- No corporate fluff, no "AI-sounding" filler, and NEVER use robotic phrases like "That's a great question."
- If a user just says "hi", "hello", or greets you, reply naturally with a warm greeting and ask how you can help them streamline their operations.

# ABOUT STRATUS
- We help trade business owners go from "doing everything themselves" to running a self-operating business (Level 5 Operations).
- We build and install 6 automated systems into their business (CRM, follow-ups, missed call text-back, review requests, appointment reminders, and lead nurturing) — done-for-you in 7 days.
- Packages:
  1. Presence: Systems 1-4 (great for getting the digital foundation locked in).
  2. Machine: All 6 systems (the full engine that runs ops while they focus on growth).
- Pricing/Action: 50% refundable deposit to lock in a build slot. 30-day satisfaction guarantee on the monthly fee.

# CORE RULES
1. BILINGUAL: Always reply in the exact same language the user writes in (English or French). Never mix them.
2. CONCISE: Keep answers tight — 1 to 3 sentences max. Entrepreneurs don't have time to read essays.
3. DIRECT: Answer the question directly without repetitive filler openings.
4. SCOPE: Don't invent features. Stick to what STRATUS actually offers.
5. CALL TO ACTION: If they ask about complex pricing or features, give a brief answer and tell them to book a free 30-min discovery call.`;


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
