import { getSql, type SqlTag } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/auth/server";
import { buildRealisticItinerary, type DestinationNode, type ExperienceNode } from "@/lib/travel/engine";

export const dynamic = "force-dynamic";

type Input = { days?: number; travelers?: number; interests?: string[]; budget?: string; pace?: string; startingPoint?: string; prompt?: string };
const allowedInterests = ["Mountains", "Coast", "Wildlife", "Culture", "Food", "Slow travel"];
const allowedBudgets = ["Budget", "Comfort", "Premium"];
const allowedPaces = ["Slow", "Balanced", "Fast"];
const allowedStarts = ["Colombo", "Airport", "Kandy", "Galle", "Ella", "Flexible"];
const safeNum = (value: unknown, min: number, max: number, fallback: number) => Math.max(min, Math.min(max, Number(value) || fallback));

type SessionUser = { id?: string; email?: string; name?: string | null };

function inferFromPrompt(raw: string, current: string[], budget: string, pace: string, days: number) {
  const text = raw.toLowerCase();
  const interests = [...current];
  const add = (terms: string[], label: string) => {
    if (terms.some((term) => text.includes(term)) && !interests.includes(label)) interests.push(label);
  };
  add(["mountain", "hiking", "tea", "hill", "ella", "nuwara"], "Mountains");
  add(["beach", "sea", "ocean", "coast", "mirissa", "galle"], "Coast");
  add(["safari", "wildlife", "leopard", "elephant", "yala"], "Wildlife");
  add(["temple", "culture", "history", "sigiriya", "kandy", "ancient"], "Culture");
  add(["food", "eat", "cooking", "cafe", "spice"], "Food");
  add(["slow", "relax", "relaxed", "chill"], "Slow travel");
  const dayMatch = text.match(/(?:for|have|got)\s*(\d{1,2})\s*days?/);
  const nextDays = dayMatch ? safeNum(dayMatch[1], 2, 21, days) : days;
  const nextBudget = text.includes("luxury") || text.includes("premium") ? "Premium" : text.includes("budget") ? "Budget" : budget;
  const nextPace = text.includes("slow") || text.includes("relax") ? "Slow" : text.includes("fast") || text.includes("packed") ? "Fast" : pace;
  return { interests: interests.slice(0, 4), budget: nextBudget, pace: nextPace, days: nextDays };
}

function score(place: DestinationNode, interests: string[], budget: string, pace: string) {
  const hay = `${place.name} ${place.region} ${place.summary}`.toLowerCase();
  let value = 10;
  const signals: Record<string, string[]> = {
    Mountains: ["ella", "nuwara", "kandy"],
    Coast: ["galle", "mirissa"],
    Wildlife: ["yala"],
    Culture: ["kandy", "sigiriya", "anuradhapura"],
    Food: ["kandy", "galle", "mirissa"],
    "Slow travel": ["ella", "nuwara", "galle", "mirissa"],
  };
  interests.forEach((interest) => (signals[interest] ?? []).forEach((term) => { if (hay.includes(term)) value += 7; }));
  if (pace === "Slow" && /ella|nuwara|mirissa|galle/i.test(hay)) value += 2;
  if (pace === "Fast" && /sigiriya|kandy|yala/i.test(hay)) value += 2;
  if (budget === "Premium" && /galle|ella|kandy/i.test(hay)) value += 1;
  return value;
}

async function resolveUserId(sql: SqlTag, user?: SessionUser) {
  if (!user?.id || !user.email) return null;
  const existing = await sql`SELECT id FROM users WHERE email = ${user.email} LIMIT 1`;
  if (existing.length) return String(existing[0].id);
  const row = await sql`
    INSERT INTO users (id, email, name, preferences)
    VALUES (${user.id}, ${user.email}, ${user.name ?? null}, '{}'::jsonb)
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;
  return row[0]?.id ? String(row[0].id) : null;
}

export async function POST(request: Request) {
  try {
    const sql = getSql();
    if (!sql) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    const body = (await request.json()) as Input;
    let days = safeNum(body.days, 2, 21, 7);
    const travelers = safeNum(body.travelers, 1, 10, 2);
    let interests = Array.isArray(body.interests)
      ? body.interests.filter((item): item is string => typeof item === "string" && allowedInterests.includes(item)).slice(0, 4)
      : ["Mountains", "Food"];
    let budget = allowedBudgets.includes(String(body.budget)) ? String(body.budget) : "Comfort";
    let pace = allowedPaces.includes(String(body.pace)) ? String(body.pace) : "Balanced";
    const startingPoint = allowedStarts.includes(String(body.startingPoint)) ? String(body.startingPoint) : "Flexible";
    const prompt = typeof body.prompt === "string" ? body.prompt.trim().slice(0, 1200) : "";

    if (prompt) {
      const inferred = inferFromPrompt(prompt, interests, budget, pace, days);
      interests = inferred.interests;
      budget = inferred.budget;
      pace = inferred.pace;
      days = inferred.days;
    }

    const [destinationRows, experienceRows] = await Promise.all([
      sql`SELECT id, slug, name, region, summary, best_time, latitude, longitude FROM destinations ORDER BY name`,
      sql`SELECT e.slug, e.name, e.category, e.summary, d.slug AS destination_slug, d.name AS destination_name FROM experiences e LEFT JOIN destinations d ON d.id=e.destination_id ORDER BY e.created_at DESC`,
    ]);

    const places = (destinationRows as DestinationNode[]).sort((a, b) => score(b, interests, budget, pace) - score(a, interests, budget, pace));
    const routeLength = days <= 3 ? 2 : days <= 6 ? 3 : days <= 10 ? 4 : 5;
    let route = places.slice(0, Math.min(routeLength, places.length));
    if (startingPoint !== "Flexible") {
      const index = route.findIndex((place) => place.name.toLowerCase() === startingPoint.toLowerCase());
      if (index > 0) {
        const first = route[index];
        route = [first, ...route.filter((place) => place.slug !== first.slug)];
      }
    }

    const experiences = experienceRows as ExperienceNode[];
    const itinerary = buildRealisticItinerary(route, experiences, days, pace, interests);
    const routeSlugs = route.map((place) => place.slug);
    const picked = experiences.filter((experience) => experience.destination_slug && routeSlugs.includes(experience.destination_slug)).slice(0, 8);

    let narrative = `A ${days}-day ${budget.toLowerCase()} journey for ${travelers} ${travelers === 1 ? "traveler" : "travelers"}, shaped around ${interests.slice(0, 2).join(" + ") || "Sri Lanka"}. The route keeps a ${pace.toLowerCase()} rhythm and follows ${route.map((place) => place.name).join(" → ")}, with open time left for the island to surprise you.`;
    let aiPowered = false;

    if (process.env.OPENAI_API_KEY) {
      try {
        const model = process.env.OPENAI_MODEL || "gpt-5-mini";
        const response = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
          body: JSON.stringify({
            model,
            input: `You are DiscoverLanka's luxury travel concierge. Rewrite this itinerary rationale in 2 short warm sentences. Profile: ${travelers} travelers, ${days} days, ${budget} budget, ${pace} pace, interests ${interests.join(", ")}, start ${startingPoint}. Route: ${route.map((place) => place.name).join(" → ")}. User note: ${prompt || "none"}. Use only supplied facts; do not invent prices, bookings, weather, or logistics.`,
            max_output_tokens: 180,
          }),
        });
        if (response.ok) {
          const payload = await response.json() as { output_text?: unknown };
          if (typeof payload.output_text === "string" && payload.output_text.trim()) {
            narrative = payload.output_text.trim();
            aiPowered = true;
          }
        }
      } catch {
        // Smart deterministic fallback remains available when the AI provider is unavailable.
      }
    }

    const auth = getServerAuth();
    const session = auth ? (await auth.getSession()).data : null;
    const userId = await resolveUserId(sql, session?.user ? { id: session.user.id, email: session.user.email, name: session.user.name } : undefined);

    let tripId: string | null = null;
    let itineraryId: string | null = null;
    if (userId) {
      const trip = await sql`
        INSERT INTO trips (user_id, title, budget, currency, status, data)
        VALUES (${userId}, ${`DiscoverLanka · ${days}-day journey`}, ${(budget === "Premium" ? 35000 : budget === "Budget" ? 9000 : 18000) * days * travelers}, 'LKR', 'draft', ${JSON.stringify({ days, travelers, interest: interests.join(", "), budgetLevel: budget, selectedSlugs: routeSlugs, itinerary, prompt })}::jsonb)
        RETURNING id
      `;
      tripId = trip[0]?.id ? String(trip[0].id) : null;
      if (tripId) {
        const saved = await sql`
          INSERT INTO itineraries (slug, title, summary, duration_days, budget_level, content)
          VALUES (${`trip-${tripId}`}, ${`DiscoverLanka · ${days} days`}, ${narrative}, ${days}, ${budget}, ${JSON.stringify({ tripId, days: itinerary })}::jsonb)
          RETURNING id
        `;
        itineraryId = saved[0]?.id ? String(saved[0].id) : null;
      }
    }

    return NextResponse.json({
      aiPowered,
      profile: { days, travelers, interests, budget, pace, startingPoint, prompt },
      route,
      experiences: picked,
      itinerary,
      narrative,
      estimatedDailyRate: budget === "Premium" ? 35000 : budget === "Budget" ? 9000 : 18000,
      routeSlugs,
      tripId,
      itineraryId,
      synced: Boolean(userId),
    });
  } catch (error) {
    console.error("Concierge error", error);
    return NextResponse.json({ error: "Could not build your journey." }, { status: 500 });
  }
}
