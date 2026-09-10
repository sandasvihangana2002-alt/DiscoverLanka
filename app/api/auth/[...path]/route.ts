import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getAuthHandler() {
  const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET?.trim();
  if (!cookieSecret) return null;
  const { auth } = await import("@/lib/auth/server");
  return auth.handler();
}

async function handler(request: Request) {
  try {
    const authHandler = await getAuthHandler();
    if (!authHandler) {
      return NextResponse.json(
        { error: "Authentication is not configured on this deployment." },
        { status: 503 }
      );
    }
    return authHandler(request);
  } catch (error) {
    console.error("Auth route error", error);
    return NextResponse.json(
      { error: "Authentication service is temporarily unavailable." },
      { status: 503 }
    );
  }
}

export const GET = handler;
export const POST = handler;
