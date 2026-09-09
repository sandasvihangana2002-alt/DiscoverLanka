import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const sql = neon(process.env.DATABASE_URL);
    const stories = await sql`
      SELECT id, slug, title, excerpt, content, category, published_at
      FROM articles
      WHERE published_at IS NULL OR published_at <= NOW()
      ORDER BY published_at DESC NULLS LAST, created_at DESC
      LIMIT 20
    `;
    return NextResponse.json({ stories });
  } catch (error) {
    console.error("Stories API error", error);
    return NextResponse.json({ error: "Unable to load stories" }, { status: 500 });
  }
}
