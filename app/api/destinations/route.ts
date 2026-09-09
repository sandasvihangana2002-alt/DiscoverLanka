import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);
    const destinations = await sql`
      SELECT id, slug, name, region, summary, description, latitude, longitude, best_time
      FROM destinations
      ORDER BY name ASC
    `;

    return NextResponse.json({ destinations });
  } catch (error) {
    console.error("Destinations API error", error);
    return NextResponse.json({ error: "Unable to load destinations" }, { status: 500 });
  }
}
