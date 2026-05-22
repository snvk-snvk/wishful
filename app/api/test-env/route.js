import { NextResponse } from "next/server";

export async function GET() {
  const keyExists = !!process.env.ANTHROPIC_API_KEY;

  return NextResponse.json({ anthropicKeyFound: keyExists });
}
