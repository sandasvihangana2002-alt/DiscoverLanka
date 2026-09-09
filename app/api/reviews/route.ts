import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const params = new URL(request.url).searchParams;
    const experienceId = params.get("experienceId");
    const destinationId = params.get("destinationId");
    const sql = neon(process.env.DATABASE_URL);
    const rows = experienceId
      ? await sql`SELECT id, experience_id, destination_id, rating, title, content, created_at FROM reviews WHERE experience_id = ${experienceId} ORDER BY created_at DESC LIMIT 50`
      : destinationId
        ? await sql`SELECT id, experience_id, destination_id, rating, title, content, created_at FROM reviews WHERE destination_id = ${destinationId} ORDER BY created_at DESC LIMIT 50`
        : await sql`SELECT id, experience_id, destination_id, rating, title, content, created_at FROM reviews ORDER BY created_at DESC LIMIT 50`;
    return NextResponse.json({ reviews: rows });
  } catch (error) {
    console.error("Reviews GET error", error);
    return NextResponse.json({ error: "Unable to load reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const body = await request.json();
    const experienceId = typeof body.experienceId === "string" ? body.experienceId : "";
    const destinationId = typeof body.destinationId === "string" ? body.destinationId : "";
    const rating = Number(body.rating);
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
    const content = typeof body.content === "string" ? body.content.trim().slice(0, 1200) : "";

    if (!experienceId && !destinationId) return NextResponse.json({ error: "Experience or destination is required" }, { status: 400 });
    if (experienceId && destinationId) return NextResponse.json({ error: "Choose one review target" }, { status: 400 });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    if (!title && !content) return NextResponse.json({ error: "Add a title or review" }, { status: 400 });

    const sql = neon(process.env.DATABASE_URL);
    if (experienceId) {
      const experience = await sql`SELECT id FROM experiences WHERE id = ${experienceId} LIMIT 1`;
      if (!experience.length) return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    } else {
      const destination = await sql`SELECT id FROM destinations WHERE id = ${destinationId} LIMIT 1`;
      if (!destination.length) return NextResponse.json({ error: "Destination not found" }, { status: 404 });
    }

    const rows = await sql`
      INSERT INTO reviews (experience_id, destination_id, rating, title, content)
      VALUES (${experienceId || null}, ${destinationId || null}, ${rating}, ${title || null}, ${content || null})
      RETURNING id, experience_id, destination_id, rating, title, content, created_at
    `;
    return NextResponse.json({ review: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Reviews POST error", error);
    return NextResponse.json({ error: "Unable to save review" }, { status: 500 });
  }
}
