import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT id, slug, title, summary, duration_days, budget_level, content, created_at, updated_at
      FROM itineraries ORDER BY updated_at DESC LIMIT 50
    `;
    return NextResponse.json({ itineraries: rows });
  } catch (error) {
    console.error("Itineraries GET error", error);
    return NextResponse.json({ error: "Unable to load itineraries" }, { status: 500 });
  }
}
