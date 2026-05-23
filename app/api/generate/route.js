import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  // ── 1. Parse & validate ────────────────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const { occasion, tone, language, personalDetails } = body;

  if (!occasion || !tone || !language) {
    return NextResponse.json(
      { error: "Missing required fields: occasion, tone, and language." },
      { status: 400 }
    );
  }

  const supportedLanguages = ["English", "Hindi", "Marathi"];
  if (!supportedLanguages.includes(language)) {
    return NextResponse.json(
      { error: `Language must be one of: ${supportedLanguages.join(", ")}.` },
      { status: 400 }
    );
  }

  // ── 2. Build the prompt ────────────────────────────────────────────────────
  const personalContext = personalDetails?.trim()
    ? `Here are some personal details to make it more specific: ${personalDetails.trim()}`
    : "Keep it warm and universally relatable.";

  const prompt = `Write a single heartfelt greeting message for the following occasion.

Occasion: ${occasion}
Tone: ${tone}
Language: ${language}
${personalContext}

Guidelines:
- Write the entire message in ${language}.
- Match the tone exactly — if the tone is humorous, be genuinely funny; if formal, be dignified.
- Keep it between 2–5 sentences: long enough to feel personal, short enough to send easily.
- Do not include a subject line, title, or any explanation — output only the greeting message itself.`;

  // ── 3. Call Gemini ─────────────────────────────────────────────────────────
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const message = result.response.text();

    return NextResponse.json({ message });
  } catch (error) {
    // ── 4. Handle errors ───────────────────────────────────────────────────
    const isRateLimit =
      error?.status === 429 ||
      error?.message?.includes("429") ||
      error?.message?.toLowerCase().includes("quota") ||
      error?.message?.toLowerCase().includes("rate");

    if (isRateLimit) {
      return NextResponse.json(
        { error: "Too many requests right now — please try again in a moment." },
        { status: 429 }
      );
    }

    console.error("[/api/generate] Gemini error:", error);
    return NextResponse.json(
      { error: "Something went wrong while generating your message. Please try again." },
      { status: 500 }
    );
  }
}
