import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

type Input = {
  days?: number;
  travelers?: number;
  interests?: string[];
  budget?: string;
  pace?: string;
  startingPoint?: string;
};

type Destination = {
  id: string;
  slug: string;
  name: string;
  region: string;
  summary: string;
  best_time: string;
  latitude: number;
  longitude: number;
};

type Experience = {
  slug: string;
  name: string;
  category: string | null;
  summary: string | null;
  destination_slug: string | null;
  destination_name: string | null;
};

const safeDays = (value: unknown) => Math.max(2, Math.min(21, Number(value) || 7));
const safeTravelers = (value: unknown) => Math.max(1, Math.min(10, Number(value) || 2));

function normalizeInterests(value: unknown) {
  const allowed = ["Mountains", "Coast", "Wildlife", "Culture", "Food", "Slow travel"];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && allowed.includes(item)).slice(0, 4)
    : ["Mountains"];
}

function scoreDestination(destination: Destination, interests: string[], budget: string, pace: string, index: number) {
  const haystack = `${destination.name} ${destination.region} ${destination.summary}`.toLowerCase();
  let score = 8 - index * 0.15;
  const signals: Record<string, string[]> = {
    Mountains: ["ella", "nuwara", "kandy"],
    Coast: ["galle", "mirissa"],
    Wildlife: ["yala"],
    Culture: ["kandy", "sigiriya", "anuradhapura"],
    Food: ["kandy", "galle", "mirissa"],
    "Slow travel": ["ella", "nuwara", "galle", "mirissa"],
  };
  interests.forEach((interest) => {
    (signals[interest] ?? []).forEach((term) => { if (haystack.includes(term)) score += 5; });
  });
  if (pace === "Slow" && /ella|nuwara|mirissa|galle/i.test(haystack)) score += 2;
  if (pace === "Fast" && /sigiriya|kandy|yala/i.test(haystack)) score += 1.5;
  if (budget === "Premium" && /galle|ella|kandy/i.test(haystack)) score += 1;
  return score;
}

function buildFallbackNarrative(input: Required<Pick<Input, "days" | "travelers" | "budget" | "pace" | "startingPoint">> & { interests: string[] }, route: Destination[]) {
  const names = route.map((place) => place.name).join(" → ");
  const focus = input.interests.slice(0, 2).join(" + ");
  const opening = input.pace === "Slow"
    ? "This journey is designed to breathe — fewer rushed transfers, longer pauses, and more room for the island to surprise you."
    : input.pace === "Fast"
      ? "This route keeps momentum high while protecting the highlights that make Sri Lanka memorable."
      : "This route balances the signature Sri Lankan highlights with enough space to enjoy them properly.";
  return `${opening} For ${input.travelers} ${input.travelers === 1 ? "traveler" : "travelers"}, a ${input.days}-day ${input.budget.toLowerCase()} journey around ${focus} works beautifully: ${names}. ${input.startingPoint !== "Flexible" ? `Starting from ${input.startingPoint},` : "With a flexible start,"} keep the first day light and let the route build toward the strongest moments.`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Input;
    const days = safeDays(body.days);
    const travelers = safeTravelers(body.travelers);
    const interests = normalizeInterests(body.interests);
    const budget = ["Budget", "Comfort", "Premium"].includes(String(body.budget)) ? String(body.budget) : "Comfort";
    const pace = ["Slow", "Balanced", "Fast"].includes(String(body.pace)) ? String(body.pace) : "Balanced";
    const startingPoint = body.startingPoint && ["Colombo", "Airport", "Kandy", "Galle", "Ella", "Flexible"].includes(body.startingPoint)
      ? body.startingPoint
      : "Flexible";

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_URL is not configured." }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);
    const [destinationRows, experienceRows] = await Promise.all([
      sql`SELECT id, slug, name, region, summary, best_time, latitude, longitude FROM destinations ORDER BY name ASC`,
      sql`SELECT e.slug, e.name, e.category, e.summary, d.slug AS destination_slug, d.name AS destination_name FROM experiences e LEFT JOIN destinations d ON d.id=e.destination_id ORDER BY e.created_at DESC`,
    ]);

    const destinations = (destinationRows as Destination[])
      .map((place, index) => ({ place, score: scoreDestination(place, interests, budget, pace, index) }))
      .sort((a, b) => b.score - a.score);
    const routeLength = days <= 3 ? 2 : days <= 6 ? 3 : days <= 10 ? 4 : 5;
    const route = destinations.slice(0, Math.min(routeLength, destinations.length)).map(({ place }) => place);
    const experiences = experienceRows as Experience[];
    const routeSlugs = new Set(route.map((place) => place.slug));
    const pickedExperiences = experiences
      .filter((item) => item.destination_slug && routeSlugs.has(item.destination_slug))
      .slice(0, 6);

    let narrative = buildFallbackNarrative({ days, travelers, interests, budget, pace, startingPoint }, route);
    let aiPowered = false;

    if (process.env.OPENAI_API_KEY) {
      try {
        const model = process.env.OPENAI_MODEL || "gpt-5-mini";
        const aiResponse = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
          body: JSON.stringify({
            model,
            input: `You are the DiscoverLanka luxury travel concierge. Create a warm, concise 2-3 sentence itinerary rationale. User: ${travelers} travelers, ${days} days, budget ${budget}, pace ${pace}, interests ${interests.join(", ")}, start ${startingPoint}. Recommended route: ${route.map((place) => `${place.name} (${place.region})`).join(" → ")}. Do not invent bookings, prices, or facts not provided.`,
            max_output_tokens: 260,
          }),
        });
        if (aiResponse.ok) {
          const payload = await aiResponse.json() as { output_text?: unknown };
          const text = typeof payload.output_text === "string" ? payload.output_text.trim() : "";
          if (text) { narrative = text; aiPowered = true; }
        }
      } catch {}
    }

    return NextResponse.json({
      aiPowered,
      profile: { days, travelers, interests, budget, pace, startingPoint },
      route,
      experiences: pickedExperiences,
      narrative,
      estimatedDailyRate: budget === "Premium" ? 35000 : budget === "Budget" ? 9000 : 18000,
      routeSlugs: route.map((place) => place.slug),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not build your journey." }, { status: 500 });
  }
}
