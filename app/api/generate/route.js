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

    // The Gemini SDK has no built-in timeout, so race it against a 20-second
    // timer. The .finally() always clears the timer — whether Gemini wins the
    // race or the timeout does — so the handle is never left dangling.
    let timeoutId;
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          const err = new Error("Gemini call timed out after 20 s");
          err.code = "TIMEOUT";
          reject(err);
        }, 20_000);
      }),
    ]).finally(() => clearTimeout(timeoutId));

    const message = result.response.text();

    // Validate that the response is a usable greeting before sending it.
    // .text() can return undefined/null if the model produced no candidates,
    // and even a real string might be empty, whitespace-only, suspiciously
    // short (model failure), or runaway long (prompt injection / hallucination).
    const trimmed = typeof message === "string" ? message.trim() : "";
    if (trimmed.length < 10 || trimmed.length > 2000) {
      return NextResponse.json(
        { error: "We couldn't generate a good message this time. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: trimmed });
  } catch (error) {
    // ── 4. Handle errors ───────────────────────────────────────────────────
    const status = error?.status;
    const msg = (error?.message ?? "").toLowerCase();

    // Our own 20-second sentinel (set above via Promise.race)
    const isTimeout = error?.code === "TIMEOUT";

    // 429 — rate limit / quota exhausted
    const isRateLimit =
      status === 429 ||
      msg.includes("429") ||
      msg.includes("quota") ||
      msg.includes("rate limit");

    // 401 / 403 — bad or missing API key (never surface internals to the user)
    const isAuth =
      status === 401 ||
      status === 403 ||
      msg.includes("401") ||
      msg.includes("403") ||
      msg.includes("unauthorized") ||
      msg.includes("forbidden") ||
      msg.includes("api key") ||
      msg.includes("invalid key");

    // Network — SDK fetch never completed (note: "timeout" is intentionally
    // omitted here; our own timeout is caught by isTimeout above)
    const isNetwork =
      error instanceof TypeError ||
      msg.includes("fetch failed") ||
      msg.includes("network") ||
      msg.includes("econnrefused") ||
      msg.includes("econnreset");

    if (isTimeout) {
      return NextResponse.json(
        { error: "The AI is taking longer than usual. Please try again." },
        { status: 504 }
      );
    }

    if (isRateLimit) {
      return NextResponse.json(
        { error: "We're getting a lot of requests right now. Please try again in a moment." },
        { status: 429 }
      );
    }

    if (isAuth) {
      return NextResponse.json(
        { error: "Something's wrong on our end. Please try again later." },
        { status: 500 }
      );
    }

    if (isNetwork) {
      return NextResponse.json(
        { error: "Couldn't reach the AI service. Check your connection and try again." },
        { status: 502 }
      );
    }

    // Unexpected — log so we can investigate, return a generic message
    console.error("[/api/generate] Gemini error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
