import { getSql, type SqlTag } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

type TripPayload = {
  title?: unknown;
  days?: unknown;
  travelers?: unknown;
  interest?: unknown;
  budgetLevel?: unknown;
  budgetEstimate?: unknown;
  selectedSlugs?: unknown;
  itinerary?: unknown;
  status?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  events?: unknown;
};

type SessionUser = { id?: string; email?: string; name?: string | null };

type TripRow = Record<string, unknown>;

async function sessionUser() {
  const auth = getServerAuth();
  if (!auth) return null;
  const result = await auth.getSession();
  return result.data?.user
    ? { id: result.data.user.id, email: result.data.user.email, name: result.data.user.name }
    : null;
}

async function resolveUserId(sql: SqlTag, user?: SessionUser) {
  if (!user?.id || !user.email) return null;
  const existing = await sql`SELECT id FROM users WHERE email = ${user.email} LIMIT 1`;
  if (existing.length) return String(existing[0].id);
  const inserted = await sql`
    INSERT INTO users (id, email, name, preferences)
    VALUES (${user.id}, ${user.email}, ${user.name ?? null}, '{}'::jsonb)
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;
  return inserted[0]?.id ? String(inserted[0].id) : null;
}

function normalizedBody(body: TripPayload) {
  const days = Math.max(1, Math.min(30, Number(body.days) || 7));
  const travelers = Math.max(1, Math.min(20, Number(body.travelers) || 1));
  const selectedSlugs = Array.isArray(body.selectedSlugs)
    ? body.selectedSlugs.filter((item): item is string => typeof item === "string").slice(0, 30)
    : [];
  const itinerary = Array.isArray(body.itinerary) ? body.itinerary.slice(0, 90) : [];
  const events = Array.isArray(body.events) ? body.events.slice(0, 30) : [];
  const interest = typeof body.interest === "string" ? body.interest.trim().slice(0, 80) : "Mountains";
  const budgetLevel = typeof body.budgetLevel === "string" ? body.budgetLevel.trim().slice(0, 40) : "Comfort";
  const title = typeof body.title === "string" && body.title.trim()
    ? body.title.trim().slice(0, 160)
    : `Sri Lanka ${days}-day ${interest} journey`;
  const budgetEstimate = Number.isFinite(Number(body.budgetEstimate)) ? Number(body.budgetEstimate) : null;
  const status = typeof body.status === "string" && ["draft", "planned", "completed", "archived"].includes(body.status)
    ? body.status
    : "draft";
  const startDate = typeof body.startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.startDate) ? body.startDate : null;
  const endDate = typeof body.endDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.endDate) ? body.endDate : null;
  return { days, travelers, selectedSlugs, itinerary, events, interest, budgetLevel, title, budgetEstimate, status, startDate, endDate };
}

async function requireOwnedTrip(sql: SqlTag, id: string, userId: string | null) {
  if (!userId) return null;
  const rows = await sql`SELECT id FROM trips WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
  return rows.length ? String(rows[0].id) : null;
}

export async function POST(request: Request) {
  try {
    const sql = getSql();
    if (!sql) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const body = (await request.json()) as TripPayload;
    const values = normalizedBody(body);
    const user = await sessionUser();
    const userId = await resolveUserId(sql, user ?? undefined);

    const data = {
      days: values.days,
      travelers: values.travelers,
      interest: values.interest,
      budgetLevel: values.budgetLevel,
      selectedSlugs: values.selectedSlugs,
      itinerary: values.itinerary,
      events: values.events,
    };

    const rows = await sql`
      INSERT INTO trips (user_id, title, start_date, end_date, budget, currency, status, data)
      VALUES (${userId}, ${values.title}, ${values.startDate}, ${values.endDate}, ${values.budgetEstimate}, 'LKR', ${values.status}, ${JSON.stringify(data)}::jsonb)
      RETURNING id, title, start_date, end_date, budget, currency, status, data, share_token, created_at, updated_at
    `;
    return NextResponse.json({ trip: rows[0], synced: Boolean(userId) }, { status: 201 });
  } catch (error) {
    console.error("Trips POST error", error);
    return NextResponse.json({ error: "Unable to create trip" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const sql = getSql();
    if (!sql) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const params = new URL(request.url).searchParams;
    const id = params.get("id");
    const share = params.get("share");
    if (!id && !share) return NextResponse.json({ error: "Trip id or share token is required" }, { status: 400 });

    if (share) {
      const rows = await sql`SELECT id, title, start_date, end_date, budget, currency, status, data, share_token, created_at, updated_at FROM trips WHERE share_token = ${share}::uuid LIMIT 1`;
      if (!rows.length) return NextResponse.json({ error: "Shared trip not found" }, { status: 404 });
      return NextResponse.json({ trip: rows[0] as TripRow, shared: true });
    }

    const user = await sessionUser();
    const userId = await resolveUserId(sql, user ?? undefined);
    if (userId) {
      const owned = await requireOwnedTrip(sql, id!, userId);
      if (!owned) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
      const rows = await sql`SELECT id, title, start_date, end_date, budget, currency, status, data, share_token, created_at, updated_at FROM trips WHERE id = ${id!} AND user_id = ${userId} LIMIT 1`;
      return NextResponse.json({ trip: rows[0] as TripRow });
    }

    const rows = await sql`SELECT id, title, start_date, end_date, budget, currency, status, data, share_token, created_at, updated_at FROM trips WHERE id = ${id!} AND user_id IS NULL LIMIT 1`;
    if (!rows.length) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    return NextResponse.json({ trip: rows[0] as TripRow });
  } catch (error) {
    console.error("Trips GET error", error);
    return NextResponse.json({ error: "Unable to load trip" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const sql = getSql();
    if (!sql) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Trip id is required" }, { status: 400 });
    const user = await sessionUser();
    const userId = await resolveUserId(sql, user ?? undefined);
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const owned = await requireOwnedTrip(sql, id, userId);
    if (!owned) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    const body = (await request.json()) as TripPayload;
    const values = normalizedBody(body);
    const rows = await sql`
      UPDATE trips
      SET title = ${values.title},
          start_date = ${values.startDate},
          end_date = ${values.endDate},
          budget = ${values.budgetEstimate},
          status = ${values.status},
          data = ${JSON.stringify({ days: values.days, travelers: values.travelers, interest: values.interest, budgetLevel: values.budgetLevel, selectedSlugs: values.selectedSlugs, itinerary: values.itinerary, events: values.events })}::jsonb,
          updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id, title, start_date, end_date, budget, currency, status, data, share_token, created_at, updated_at
    `;
    return NextResponse.json({ trip: rows[0] });
  } catch (error) {
    console.error("Trips PATCH error", error);
    return NextResponse.json({ error: "Unable to update trip" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const sql = getSql();
    if (!sql) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Trip id is required" }, { status: 400 });
    const user = await sessionUser();
    const userId = await resolveUserId(sql, user ?? undefined);
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const rows = await sql`DELETE FROM trips WHERE id = ${id} AND user_id = ${userId} RETURNING id`;
    if (!rows.length) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    return NextResponse.json({ deleted: true, id: String(rows[0].id) });
  } catch (error) {
    console.error("Trips DELETE error", error);
    return NextResponse.json({ error: "Unable to delete trip" }, { status: 500 });
  }
}
