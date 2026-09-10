import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

type Body = {
  experienceId?: unknown;
  tripId?: unknown;
  providerId?: unknown;
  guestName?: unknown;
  guestEmail?: unknown;
  guestPhone?: unknown;
  requestedDate?: unknown;
  travelers?: unknown;
  notes?: unknown;
};

const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : null;

export async function POST(request: Request) {
  try {
    const sql = getSql();
    if (!sql) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const body = (await request.json()) as Body;
    const experienceId = text(body.experienceId, 80);
    const tripId = text(body.tripId, 80);
    const providerId = text(body.providerId, 80);
    const guestName = text(body.guestName, 120);
    const guestEmail = text(body.guestEmail, 180);
    const guestPhone = text(body.guestPhone, 60);
    const requestedDate = typeof body.requestedDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.requestedDate) ? body.requestedDate : null;
    const travelers = Math.max(1, Math.min(50, Number(body.travelers) || 1));
    const notes = text(body.notes, 1200);

    if (!experienceId) return NextResponse.json({ error: "Experience is required" }, { status: 400 });
    if (!guestName) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!guestEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) return NextResponse.json({ error: "A valid email is required" }, { status: 400 });

    const auth = getServerAuth();
    const { data: session } = auth ? await auth.getSession() : { data: { user: null } as { user: null } };
    let userId: string | null = null;
    if (session?.user?.email) {
      const user = await sql`SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1`;
      userId = user[0]?.id ? String(user[0].id) : null;
    }

    const experience = await sql`SELECT id FROM experiences WHERE id = ${experienceId} LIMIT 1`;
    if (!experience.length) return NextResponse.json({ error: "Experience not found" }, { status: 404 });

    const rows = await sql`
      INSERT INTO booking_requests (user_id, trip_id, experience_id, provider_id, guest_name, guest_email, guest_phone, requested_date, travelers, notes)
      VALUES (${userId}, ${tripId}, ${experienceId}, ${providerId}, ${guestName}, ${guestEmail}, ${guestPhone}, ${requestedDate}, ${travelers}, ${notes})
      RETURNING id, status, created_at
    `;
    return NextResponse.json({ booking: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Booking request POST error", error);
    return NextResponse.json({ error: "Unable to submit booking request" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const sql = getSql();
    if (!sql) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const auth = getServerAuth();
    if (!auth) return NextResponse.json({ error: "Authentication is not configured" }, { status: 503 });
    const { data: session } = await auth.getSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const user = await sql`SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1`;
    if (!user.length) return NextResponse.json({ bookings: [] });
    const rows = await sql`
      SELECT b.id, b.status, b.requested_date, b.travelers, b.guest_name, b.guest_email, b.notes, b.created_at,
             e.slug AS experience_slug, e.name AS experience_name
      FROM booking_requests b
      LEFT JOIN experiences e ON e.id = b.experience_id
      WHERE b.user_id = ${user[0].id}
      ORDER BY b.created_at DESC
      LIMIT 50
    `;
    return NextResponse.json({ bookings: rows });
  } catch (error) {
    console.error("Booking requests GET error", error);
    return NextResponse.json({ error: "Unable to load booking requests" }, { status: 500 });
  }
}
