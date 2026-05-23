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

  // Tone-specific one-liner, injected based on the tone value.
  const toneMap = {
    funny:         "Use light wordplay or a relatable observation — aim for a genuine smile, not a punchline. Never crude.",
    humorous:      "Use light wordplay or a relatable observation — aim for a genuine smile, not a punchline. Never crude.",
    formal:        "Warm but professional — dignified language suitable for a colleague, a superior, or distant family.",
    heartfelt:     "Sincere and specific. Avoid generic phrases like 'wishing you all the best' — say something that could only fit this occasion.",
    "warm/heartfelt": "Sincere and specific. Avoid generic phrases like 'wishing you all the best' — say something that could only fit this occasion.",
    warm:          "Sincere and specific. Avoid generic phrases like 'wishing you all the best' — say something that could only fit this occasion.",
    poetic:        "Use one strong image or a sense of rhythm. Evocative, not florid — grounded in feeling, not overwrought.",
    casual:        "Write like a friend texting another friend. Contractions are fine. Keep it natural and unforced.",
  };
  const toneKey = tone.toLowerCase();
  const toneDetail = toneMap[toneKey] ?? `Honor the ${tone} tone authentically — specific and unforced, never generic.`;

  // Condolence block is only injected when the occasion calls for it.
  const isCondolence = /condolen|bereavement|loss|grief|mourn|sympath|passed away|death/i.test(occasion);
  const condolenceBlock = isCondolence
    ? `
CONDOLENCE
- Acknowledge the loss directly; do not dance around it.
- Focus on the person who was lost — their character, their impact — and on the relationship between sender and recipient.
- Offer presence and solidarity, not solutions or silver linings.
- Never use: "in a better place," "everything happens for a reason," "time heals all wounds," or any close variant.`
    : "";

  // Personal details: pass the raw value; the prompt handles both cases.
  const personalContext = personalDetails?.trim() || "";

  const prompt = `You are a thoughtful greeting writer with deep cultural sensitivity for English, Hindi, and Marathi contexts. You treat each language as a first-class creative medium — not a translation target. You know when to use formal registers (aap / आप) versus familiar ones (tum / तुम), and you understand the texture of authentic expression in each language.

Write a greeting message for the following:

Occasion: ${occasion}
Tone: ${tone}
Language: ${language}${personalContext ? `\nPersonal details: ${personalContext}` : ""}

LANGUAGE
- Write natively in ${language}. Hindi and Marathi must use Devanagari script and read as a native speaker wrote them — not as English translated.
- Match the formality register to the occasion: use आप / aap for formal situations (elders, colleagues, distant relatives), तुम / tum for close friends and peers.

LENGTH
- Between 30 and 60 words. One paragraph, or two short ones.
- Never a single sentence. Never longer than a greeting card.

TONE
${toneDetail}
${condolenceBlock}
PERSONAL DETAILS
- If personal details are provided, weave them in naturally across the message — don't stack them into one sentence or list them.
- If no personal details are given, write a strong, specific message anyway. Do not apologize for the lack of details or make it feel like a template.

OUTPUT
- Output only the message. No preamble, no label like "Here's your greeting:", no quotation marks around the text.
- Do not add a closing sign-off (e.g. "Warm regards") unless it fits the occasion naturally.`;

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
