import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = getSql();
    if (!sql) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const auth = getServerAuth();
    if (!auth) return NextResponse.json({ error: "Authentication is not configured" }, { status: 503 });
    const { data: session } = await auth.getSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const user = await sql`SELECT id, email, name, preferences FROM users WHERE email = ${session.user.email} LIMIT 1`;
    if (!user.length) return NextResponse.json({ trips: [], user: null });

    const trips = await sql`
      SELECT id, title, start_date, end_date, budget, currency, status, data, created_at, updated_at
      FROM trips
      WHERE user_id = ${user[0].id}
      ORDER BY updated_at DESC
      LIMIT 50
    `;
    return NextResponse.json({ trips, user: user[0] });
  } catch (error) {
    console.error("Cloud trips GET error", error);
    return NextResponse.json({ error: "Unable to load cloud trips" }, { status: 500 });
  }
}
