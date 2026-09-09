import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const sql = neon(process.env.DATABASE_URL);
    const [events, seasons] = await Promise.all([
      sql`SELECT id, name, description, location, starts_at, ends_at, official_source FROM events WHERE ends_at IS NULL OR ends_at >= NOW() ORDER BY starts_at ASC NULLS LAST LIMIT 50`,
      sql`SELECT id, name, months, notes, created_at FROM seasons ORDER BY name ASC`
    ]);
    return NextResponse.json({ events, seasons });
  } catch (error) {
    console.error("Events API error", error);
    return NextResponse.json({ error: "Unable to load events and seasons" }, { status: 500 });
  }
}
