import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

type TripPayload = { title?: string; days?: number; travelers?: number; interest?: string; budgetLevel?: string; budgetEstimate?: number; selectedSlugs?: string[]; itinerary?: unknown[] };

async function resolveUserId(sql: ReturnType<typeof neon>, sessionUser?: { id?: string; email?: string; name?: string | null }) {
  if (!sessionUser?.id || !sessionUser.email) return null;
  const existing = await sql`SELECT id FROM users WHERE email = ${sessionUser.email} LIMIT 1`;
  if (existing.length) return existing[0].id as string;
  const inserted = await sql`INSERT INTO users (id, email, name, preferences) VALUES (${sessionUser.id}, ${sessionUser.email}, ${sessionUser.name ?? null}, '{}'::jsonb) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name RETURNING id`;
  return inserted[0]?.id as string | null;
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const body = (await request.json()) as TripPayload;
    const days = Math.max(1, Math.min(30, Number(body.days) || 7));
    const travelers = Math.max(1, Math.min(20, Number(body.travelers) || 1));
    const selectedSlugs = Array.isArray(body.selectedSlugs) ? body.selectedSlugs.filter((x): x is string => typeof x === "string").slice(0, 30) : [];
    const itinerary = Array.isArray(body.itinerary) ? body.itinerary.slice(0, 60) : [];
    const budgetLevel = typeof body.budgetLevel === "string" ? body.budgetLevel.slice(0, 40) : "Comfort";
    const interest = typeof body.interest === "string" ? body.interest.slice(0, 80) : "Mountains";
    const title = typeof body.title === "string" && body.title.trim() ? body.title.trim().slice(0, 160) : `Sri Lanka ${days}-day ${interest} journey`;
    const budgetEstimate = Number.isFinite(Number(body.budgetEstimate)) ? Number(body.budgetEstimate) : null;
    const sql = neon(process.env.DATABASE_URL);
    const auth = getServerAuth();
    const session = auth ? (await auth.getSession()).data : null;
    const userId = await resolveUserId(sql, session?.user ? { id: session.user.id, email: session.user.email, name: session.user.name } : undefined);
    const data = { days, travelers, interest, budgetLevel, selectedSlugs, itinerary };
    const rows = await sql`INSERT INTO trips (user_id, title, budget, currency, status, data) VALUES (${userId}, ${title}, ${budgetEstimate}, 'LKR', 'draft', ${JSON.stringify(data)}::jsonb) RETURNING id, title, budget, currency, status, data, created_at, updated_at`;
    return NextResponse.json({ trip: rows[0], synced: Boolean(userId) }, { status: 201 });
  } catch (error) {
    console.error("Trips POST error", error);
    return NextResponse.json({ error: "Unable to create trip" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Trip id is required" }, { status: 400 });
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT id, title, budget, currency, status, data, created_at, updated_at FROM trips WHERE id = ${id} LIMIT 1`;
    if (!rows.length) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    return NextResponse.json({ trip: rows[0] });
  } catch (error) {
    console.error("Trips GET error", error);
    return NextResponse.json({ error: "Unable to load trip" }, { status: 500 });
  }
}
