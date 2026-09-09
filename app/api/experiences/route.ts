import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const sql = neon(process.env.DATABASE_URL);
    const experiences = await sql`
      SELECT e.id, e.slug, e.name, e.category, e.summary, e.description, e.price_from, e.currency,
             d.slug AS destination_slug, d.name AS destination_name
      FROM experiences e
      LEFT JOIN destinations d ON d.id = e.destination_id
      ORDER BY e.name ASC
    `;
    return NextResponse.json({ experiences });
  } catch (error) {
    console.error("Experiences API error", error);
    return NextResponse.json({ error: "Unable to load experiences" }, { status: 500 });
  }
}
