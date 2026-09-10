import { getSql, type SqlTag } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

type PreferencesPayload = { name?: unknown; preferences?: unknown };

async function getUser(sql: SqlTag) {
  const auth = getServerAuth();
  if (!auth) return null;
  const { data } = await auth.getSession();
  if (!data?.user?.id || !data.user.email) return null;

  const existing = await sql`SELECT id, email, name, preferences FROM users WHERE email = ${data.user.email} LIMIT 1`;
  if (existing.length) return existing[0];

  const created = await sql`
    INSERT INTO users (id, email, name, preferences)
    VALUES (${data.user.id}, ${data.user.email}, ${data.user.name ?? null}, '{}'::jsonb)
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    RETURNING id, email, name, preferences
  `;
  return created[0] ?? null;
}

function safePreferences(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export async function GET() {
  try {
    const sql = getSql();
    if (!sql) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const user = await getUser(sql);
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Me preferences GET error", error);
    return NextResponse.json({ error: "Unable to load profile" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const sql = getSql();
    if (!sql) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const user = await getUser(sql);
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const body = (await request.json()) as PreferencesPayload;
    const nextName = typeof body.name === "string" ? body.name.trim().slice(0, 120) : null;
    const nextPreferences = safePreferences(body.preferences);
    const rows = await sql`
      UPDATE users
      SET name = COALESCE(${nextName}, name), preferences = ${JSON.stringify(nextPreferences)}::jsonb, updated_at = NOW()
      WHERE id = ${user.id}
      RETURNING id, email, name, preferences
    `;
    return NextResponse.json({ user: rows[0] });
  } catch (error) {
    console.error("Me preferences PATCH error", error);
    return NextResponse.json({ error: "Unable to save profile" }, { status: 500 });
  }
}
