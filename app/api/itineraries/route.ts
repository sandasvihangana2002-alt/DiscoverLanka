import { getSql, type SqlTag } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

type ItineraryPayload = {
  tripId?: unknown;
  title?: unknown;
  summary?: unknown;
  durationDays?: unknown;
  budgetLevel?: unknown;
  content?: unknown;
};

async function currentUser(sql: SqlTag) {
  const auth = getServerAuth();
  if (!auth) return null;
  const { data } = await auth.getSession();
  if (!data?.user?.id || !data.user.email) return null;
  const rows = await sql`SELECT id, email, name FROM users WHERE email = ${data.user.email} LIMIT 1`;
  if (rows.length) return { id: String(rows[0].id), email: String(rows[0].email), name: rows[0].name };
  const created = await sql`
    INSERT INTO users (id, email, name, preferences)
    VALUES (${data.user.id}, ${data.user.email}, ${data.user.name ?? null}, '{}'::jsonb)
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    RETURNING id, email, name
  `;
  return created[0] ? { id: String(created[0].id), email: String(created[0].email), name: created[0].name } : null;
}

async function ownTrip(sql: SqlTag, tripId: string, userId: string) {
  const rows = await sql`SELECT id FROM trips WHERE id = ${tripId} AND user_id = ${userId} LIMIT 1`;
  return rows.length > 0;
}

function normalize(payload: ItineraryPayload) {
  const tripId = typeof payload.tripId === "string" ? payload.tripId.trim() : "";
  const title = typeof payload.title === "string" && payload.title.trim() ? payload.title.trim().slice(0, 160) : "Sri Lanka itinerary";
  const summary = typeof payload.summary === "string" ? payload.summary.trim().slice(0, 1000) : null;
  const durationDays = Math.max(1, Math.min(30, Number(payload.durationDays) || 1));
  const budgetLevel = typeof payload.budgetLevel === "string" ? payload.budgetLevel.trim().slice(0, 40) : "Comfort";
  const content = payload.content && typeof payload.content === "object" ? payload.content : { days: [] };
  return { tripId, title, summary, durationDays, budgetLevel, content };
}

export async function GET(request: Request) {
  try {
    const sql = getSql();
    if (!sql) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const tripId = new URL(request.url).searchParams.get("tripId")?.trim() ?? "";
    if (!tripId) return NextResponse.json({ error: "tripId is required" }, { status: 400 });

    const user = await currentUser(sql);
    if (user) {
      if (!(await ownTrip(sql, tripId, user.id))) return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
      const rows = await sql`SELECT id, title, summary, duration_days, budget_level, content, created_at, updated_at FROM itineraries WHERE content->>'tripId' = ${tripId} ORDER BY updated_at DESC LIMIT 1`;
      return NextResponse.json({ itinerary: rows[0] ?? null, synced: true });
    }

    const rows = await sql`SELECT id, title, summary, duration_days, budget_level, content, created_at, updated_at FROM itineraries WHERE content->>'tripId' = ${tripId} LIMIT 1`;
    return NextResponse.json({ itinerary: rows[0] ?? null, synced: false });
  } catch (error) {
    console.error("Itineraries GET error", error);
    return NextResponse.json({ error: "Unable to load itinerary" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sql = getSql();
    if (!sql) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const payload = normalize((await request.json()) as ItineraryPayload);
    if (!payload.tripId) return NextResponse.json({ error: "tripId is required" }, { status: 400 });

    const user = await currentUser(sql);
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    if (!(await ownTrip(sql, payload.tripId, user.id))) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    const content = { ...(payload.content as Record<string, unknown>), tripId: payload.tripId };
    const existing = await sql`SELECT id FROM itineraries WHERE content->>'tripId' = ${payload.tripId} ORDER BY updated_at DESC LIMIT 1`;
    const rows = existing.length
      ? await sql`UPDATE itineraries SET title=${payload.title}, summary=${payload.summary}, duration_days=${payload.durationDays}, budget_level=${payload.budgetLevel}, content=${JSON.stringify(content)}::jsonb, updated_at=NOW() WHERE id=${existing[0].id} RETURNING id, title, summary, duration_days, budget_level, content, created_at, updated_at`
      : await sql`INSERT INTO itineraries (slug, title, summary, duration_days, budget_level, content) VALUES (${`trip-${payload.tripId}`}, ${payload.title}, ${payload.summary}, ${payload.durationDays}, ${payload.budgetLevel}, ${JSON.stringify(content)}::jsonb) RETURNING id, title, summary, duration_days, budget_level, content, created_at, updated_at`;

    return NextResponse.json({ itinerary: rows[0], synced: true }, { status: existing.length ? 200 : 201 });
  } catch (error) {
    console.error("Itineraries POST error", error);
    return NextResponse.json({ error: "Unable to save itinerary" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const sql = getSql();
    if (!sql) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const payload = normalize((await request.json()) as ItineraryPayload);
    if (!payload.tripId) return NextResponse.json({ error: "tripId is required" }, { status: 400 });

    const user = await currentUser(sql);
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    if (!(await ownTrip(sql, payload.tripId, user.id))) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    const content = { ...(payload.content as Record<string, unknown>), tripId: payload.tripId };
    const rows = await sql`UPDATE itineraries SET title=${payload.title}, summary=${payload.summary}, duration_days=${payload.durationDays}, budget_level=${payload.budgetLevel}, content=${JSON.stringify(content)}::jsonb, updated_at=NOW() WHERE content->>'tripId'=${payload.tripId} RETURNING id, title, summary, duration_days, budget_level, content, created_at, updated_at`;
    if (!rows.length) return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
    return NextResponse.json({ itinerary: rows[0], synced: true });
  } catch (error) {
    console.error("Itineraries PATCH error", error);
    return NextResponse.json({ error: "Unable to update itinerary" }, { status: 500 });
  }
}
