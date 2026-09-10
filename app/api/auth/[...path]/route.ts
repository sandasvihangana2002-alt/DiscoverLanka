import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<Record<string, string | string[]>> };
type RouteHandler = (request: Request, context: RouteContext) => Response | Promise<Response>;
type AuthHandlers = { GET: RouteHandler; POST: RouteHandler };

function getHandlers(): AuthHandlers | null {
  const auth = getServerAuth();
  if (!auth) return null;
  return auth.handler() as unknown as AuthHandlers;
}

async function runAuthHandler(method: keyof AuthHandlers, request: Request, context: RouteContext) {
  try {
    const handlers = getHandlers();
    if (!handlers) {
      return NextResponse.json(
        { error: "Authentication is not configured on this deployment." },
        { status: 503 },
      );
    }
    return await handlers[method](request, context);
  } catch (error) {
    console.error(`Auth ${method} route error`, error);
    return NextResponse.json(
      { error: "Authentication service is temporarily unavailable." },
      { status: 503 },
    );
  }
}

export const GET = (request: Request, context: RouteContext) =>
  runAuthHandler("GET", request, context);
export const POST = (request: Request, context: RouteContext) =>
  runAuthHandler("POST", request, context);
