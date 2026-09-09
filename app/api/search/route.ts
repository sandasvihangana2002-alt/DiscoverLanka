import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) return NextResponse.json({ destinations: [], experiences: [], stories: [] });
    const term = `%${q.slice(0, 80)}%`;
    const sql = neon(process.env.DATABASE_URL);
    const [destinations, experiences, stories] = await Promise.all([
      sql`SELECT id, slug, name, region, summary FROM destinations WHERE name ILIKE ${term} OR region ILIKE ${term} OR summary ILIKE ${term} ORDER BY name LIMIT 20`,
      sql`SELECT id, slug, name, category, summary FROM experiences WHERE name ILIKE ${term} OR category ILIKE ${term} OR summary ILIKE ${term} ORDER BY name LIMIT 20`,
      sql`SELECT id, slug, title, excerpt, category FROM articles WHERE published_at IS NOT NULL AND (title ILIKE ${term} OR excerpt ILIKE ${term} OR category ILIKE ${term}) ORDER BY published_at DESC NULLS LAST LIMIT 20`
    ]);
    return NextResponse.json({ destinations, experiences, stories });
  } catch (error) {
    console.error("Search API error", error);
    return NextResponse.json({ error: "Unable to search" }, { status: 500 });
  }
}
