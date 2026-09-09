import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const params = new URL(request.url).searchParams;
    const experienceId = params.get("experienceId");
    const sql = neon(process.env.DATABASE_URL);
    const rows = experienceId
      ? await sql`SELECT id, experience_id, rating, title, content, created_at FROM reviews WHERE experience_id = ${experienceId} ORDER BY created_at DESC LIMIT 50`
      : await sql`SELECT id, experience_id, rating, title, content, created_at FROM reviews ORDER BY created_at DESC LIMIT 50`;
    return NextResponse.json({ reviews: rows });
  } catch (error) {
    console.error("Reviews GET error", error);
    return NextResponse.json({ error: "Unable to load reviews" }, { status: 500 });
  }
}
