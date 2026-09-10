import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<Record<string, string | string[]>>;
};

type AuthHandler = (
  request: Request,
  context: RouteContext
) => Response | Promise<Response>;

async function getAuthHandler(): Promise<AuthHandler | null> {
  const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET?.trim();
  if (!cookieSecret) return null;

  const { auth } = await import("@/lib/auth/server");
  return auth.handler() as AuthHandler;
}

async function handler(request: Request, context: RouteContext) {
  try {
    const authHandler = await getAuthHandler();
    if (!authHandler) {
      return NextResponse.json(
        { error: "Authentication is not configured on this deployment." },
        { status: 503 }
      );
    }

    return await authHandler(request, context);
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
