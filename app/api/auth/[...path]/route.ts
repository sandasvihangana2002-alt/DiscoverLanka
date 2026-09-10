import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<Record<string, string | string[]>> };
type AuthHandler = (request: Request, context: RouteContext) => Response | Promise<Response>;

async function handler(request: Request, context: RouteContext) {
  try {
    const auth = getServerAuth();
    if (!auth) return NextResponse.json({ error: "Authentication is not configured on this deployment." }, { status: 503 });
    return await (auth.handler() as unknown as AuthHandler)(request, context);
  } catch (error) {
    console.error("Auth route error", error);
    return NextResponse.json({ error: "Authentication service is temporarily unavailable." }, { status: 503 });
  }
}

export const GET = handler;
export const POST = handler;
