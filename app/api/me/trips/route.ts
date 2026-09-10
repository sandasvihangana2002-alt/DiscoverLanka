import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });

    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT id, title, budget, currency, status, data, created_at, updated_at
      FROM trips
      WHERE user_id = ${session.user.id}
      ORDER BY updated_at DESC
      LIMIT 20
    `;
    return NextResponse.json({ trips: rows });
  } catch (error) {
    console.error("Cloud trips GET error", error);
    return NextResponse.json({ error: "Unable to load cloud trips" }, { status: 500 });
  }
}
