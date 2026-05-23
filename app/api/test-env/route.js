import { NextResponse } from "next/server";

export async function GET() {
  const keyExists = !!process.env.GEMINI_API_KEY;

  return NextResponse.json({ keyFound: keyExists });
}
