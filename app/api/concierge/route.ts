import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

type Input = { days?: number; travelers?: number; interests?: string[]; budget?: string; pace?: string; startingPoint?: string };
type Destination = { id: string; slug: string; name: string; region: string; summary: string; best_time: string; latitude: number; longitude: number };
type Experience = { slug: string; name: string; category: string | null; summary: string | null; destination_slug: string | null; destination_name: string | null };
type DayPlan = { day: number; destination: { slug: string; name: string; region: string }; transfer_minutes: number; transfer_note?: string; focus: string; items: Array<{ time: string; title: string; detail: string }> };

const safeDays = (value: unknown) => Math.max(2, Math.min(21, Number(value) || 7));
const safeTravelers = (value: unknown) => Math.max(1, Math.min(10, Number(value) || 2));
const allowedInterests = ["Mountains", "Coast", "Wildlife", "Culture", "Food", "Slow travel"];
const allowedBudgets = ["Budget", "Comfort", "Premium"];
const allowedPaces = ["Slow", "Balanced", "Fast"];
const allowedStarts = ["Colombo", "Airport", "Kandy", "Galle", "Ella", "Flexible"];
const startCoords: Record<string, [number, number]> = { Colombo: [6.9271, 79.8612], Airport: [7.180, 79.884], Kandy: [7.2906, 80.6337], Galle: [6.0329, 80.2168], Ella: [6.8667, 81.0466] };

function normalizeInterests(value: unknown) {
  const picks = Array.isArray(value) ? value.filter((x): x is string => typeof x === "string" && allowedInterests.includes(x)).slice(0, 4) : [];
  return picks.length ? picks : ["Mountains"];
}

function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const r = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function transferMinutes(a: Destination | null, b: Destination) {
  if (!a) return 0;
  const km = distanceKm(a, b);
  const hill = /ella|nuwara|kandy/i.test(`${a.slug} ${b.slug}`);
  const averageSpeed = hill ? 28 : 38;
  return Math.max(25, Math.round((km * 1.35 / averageSpeed) * 60));
}

function scoreDestination(destination: Destination, interests: string[], budget: string, pace: string, index: number, startName: string) {
  const text = `${destination.name} ${destination.region} ${destination.summary}`.toLowerCase();
  const signals: Record<string, string[]> = { Mountains: ["ella", "nuwara", "kandy"], Coast: ["galle", "mirissa"], Wildlife: ["yala"], Culture: ["kandy", "sigiriya", "anuradhapura"], Food: ["kandy", "galle", "mirissa"], "Slow travel": ["ella", "nuwara", "galle", "mirissa"] };
  let score = 10 - index * 0.12;
  interests.forEach((interest) => (signals[interest] ?? []).forEach((term) => { if (text.includes(term)) score += 6; }));
  if (pace === "Slow" && /ella|nuwara|mirissa|galle/i.test(text)) score += 2;
  if (pace === "Fast" && /sigiriya|kandy|yala/i.test(text)) score += 1.5;
  if (budget === "Premium" && /galle|ella|kandy/i.test(text)) score += 1;
  if (startName !== "Flexible" && destination.slug === startName.toLowerCase().replace(/ /g, "-")) score += 7;
  return score;
}

function orderRoute(candidates: Destination[], startName: string) {
  const pool = [...candidates];
  const ordered: Destination[] = [];
  const start = startCoords[startName];
  if (start && pool.length) {
    pool.sort((a, b) => Math.hypot(a.latitude - start[0], a.longitude - start[1]) - Math.hypot(b.latitude - start[0], b.longitude - start[1]));
  }
  if (pool.length) ordered.push(pool.shift()!);
  while (pool.length) {
    const from = ordered.at(-1)!;
    let nearestIndex = 0;
    let nearest = Infinity;
    pool.forEach((place, index) => { const d = distanceKm(from, place); if (d < nearest) { nearest = d; nearestIndex = index; } });
    ordered.push(pool.splice(nearestIndex, 1)[0]);
  }
  return ordered;
}

function chooseFocus(interests: string[], destination: Destination, dayInStop: number) {
  if (dayInStop > 1) return "Slow exploration & local texture";
  if (/yala/i.test(destination.slug) && interests.includes("Wildlife")) return "Wild Sri Lanka";
  if (/kandy|sigiriya|anuradhapura/i.test(destination.slug) && interests.includes("Culture")) return "Culture & heritage";
  if (/galle|mirissa/i.test(destination.slug) && interests.includes("Coast")) return "Sea air & southern coast";
  if (/ella|nuwara|kandy/i.test(destination.slug) && interests.includes("Mountains")) return "Mountain country";
  if (interests.includes("Food")) return "Local flavours & an unhurried table";
  return interests[0] ?? "Sri Lanka";
}

function makeDayPlans(route: Destination[], days: number, interests: string[], pace: string): DayPlan[] {
  if (!route.length) return [];
  const stays = route.map(() => 1);
  let extras = Math.max(0, days - route.length);
  let cursor = 0;
  while (extras > 0) { stays[cursor % stays.length] += 1; cursor += 1; extras -= 1; }
  const plans: DayPlan[] = [];
  let day = 1;
  route.forEach((destination, routeIndex) => {
    for (let localDay = 1; localDay <= stays[routeIndex] && day <= days; localDay += 1) {
      const previous = routeIndex > 0 ? route[routeIndex - 1] : null;
      const minutes = transferMinutes(previous, destination);
      const focus = chooseFocus(interests, destination, localDay);
      const transferNote = routeIndex === 0 ? undefined : `Approx. ${minutes} min transfer before the main afternoon plan.`;
      const items = localDay === 1
        ? [
            { time: routeIndex === 0 ? "Morning" : "09:00", title: routeIndex === 0 ? "Arrive & settle" : `Travel from ${previous?.name}`, detail: routeIndex === 0 ? "Keep the first hours light and leave room for the journey to unfold." : transferNote ?? "Allow a generous transfer window." },
            { time: routeIndex === 0 ? "Afternoon" : "15:00", title: focus, detail: destination.summary },
            { time: "18:30", title: "Golden hour pause", detail: pace === "Fast" ? "Finish with one simple local stop rather than adding another major attraction." : "Keep the evening open for a slow walk, a drink or a local dinner." },
          ]
        : [
            { time: "08:00", title: "Quiet start", detail: `Start slowly in ${destination.name} before the heat and crowds build.` },
            { time: "11:00", title: focus, detail: "Choose one meaningful activity and give it the time it deserves." },
            { time: "17:00", title: "Open evening", detail: "Leave the final hours intentionally unplanned for local discovery." },
          ];
      plans.push({ day, destination: { slug: destination.slug, name: destination.name, region: destination.region }, transfer_minutes: minutes, transfer_note: transferNote, focus, items });
      day += 1;
    }
  });
  return plans;
}

function buildFallbackNarrative(input: { days: number; travelers: number; budget: string; pace: string; startingPoint: string; interests: string[] }, route: Destination[]) {
  const names = route.map((place) => place.name).join(" → ");
  const focus = input.interests.slice(0, 2).join(" + ");
  const opening = input.pace === "Slow" ? "This journey is designed to breathe — fewer rushed transfers, longer pauses and space for the island to surprise you." : input.pace === "Fast" ? "This route keeps momentum high while protecting the signature moments that make Sri Lanka memorable." : "This route balances signature Sri Lankan highlights with enough space to actually enjoy them.";
  return `${opening} For ${input.travelers} ${input.travelers === 1 ? "traveler" : "travelers"}, a ${input.days}-day ${input.budget.toLowerCase()} journey around ${focus} works beautifully: ${names}. ${input.startingPoint !== "Flexible" ? `Starting from ${input.startingPoint},` : "With a flexible start,"} the itinerary deliberately keeps major activities spaced out rather than turning every day into a checklist.`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Input;
    const days = safeDays(body.days);
    const travelers = safeTravelers(body.travelers);
    const interests = normalizeInterests(body.interests);
    const budget = allowedBudgets.includes(String(body.budget)) ? String(body.budget) : "Comfort";
    const pace = allowedPaces.includes(String(body.pace)) ? String(body.pace) : "Balanced";
    const startingPoint = body.startingPoint && allowedStarts.includes(body.startingPoint) ? body.startingPoint : "Flexible";
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL is not configured." }, { status: 500 });

    const sql = neon(process.env.DATABASE_URL);
    const [destinationRows, experienceRows] = await Promise.all([
      sql`SELECT id, slug, name, region, summary, best_time, latitude, longitude FROM destinations ORDER BY name ASC`,
      sql`SELECT e.slug, e.name, e.category, e.summary, d.slug AS destination_slug, d.name AS destination_name FROM experiences e LEFT JOIN destinations d ON d.id=e.destination_id ORDER BY e.created_at DESC`,
    ]);

    const ranked = (destinationRows as Destination[]).map((place, index) => ({ place, score: scoreDestination(place, interests, budget, pace, index, startingPoint) })).sort((a, b) => b.score - a.score);
    const routeLength = days <= 3 ? 2 : days <= 6 ? 3 : days <= 10 ? 4 : 5;
    const route = orderRoute(ranked.slice(0, Math.min(routeLength + 1, ranked.length)).map((item) => item.place).slice(0, routeLength), startingPoint);
    const itinerary = makeDayPlans(route, days, interests, pace);
    const routeSlugs = route.map((place) => place.slug);
    const experiences = experienceRows as Experience[];
    const pickedExperiences = experiences.filter((item) => item.destination_slug && routeSlugs.includes(item.destination_slug)).slice(0, 6);

    let narrative = buildFallbackNarrative({ days, travelers, interests, budget, pace, startingPoint }, route);
    let aiPowered = false;
    let cloudSynced = false;
    let user: { id?: string; email?: string; name?: string | null } | null = null;
    try { const result = await auth.getSession(); user = result.data?.user ?? null; } catch {}

    if (user?.id && user.email) {
      await sql`INSERT INTO users (id, email, name, preferences) VALUES (${user.id}, ${user.email}, ${user.name ?? null}, ${JSON.stringify({ interests, budget, pace, startingPoint })}::jsonb) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, preferences = EXCLUDED.preferences, updated_at = NOW()`;
      cloudSynced = true;
    }

    if (process.env.OPENAI_API_KEY) {
      try {
        const model = process.env.OPENAI_MODEL || "gpt-5-mini";
        const aiResponse = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model, input: `You are the DiscoverLanka luxury travel concierge. Write a warm concise 2-3 sentence rationale using only the supplied facts. User: ${travelers} travelers, ${days} days, budget ${budget}, pace ${pace}, interests ${interests.join(", ")}, start ${startingPoint}. Route: ${route.map((p) => `${p.name} (${p.region})`).join(" → ")}.`, max_output_tokens: 260 }) });
        if (aiResponse.ok) {
          const payload = await aiResponse.json() as { output_text?: unknown };
          if (typeof payload.output_text === "string" && payload.output_text.trim()) { narrative = payload.output_text.trim(); aiPowered = true; }
        }
      } catch {}
    }

    return NextResponse.json({ aiPowered, cloudSynced, profile: { days, travelers, interests, budget, pace, startingPoint }, route, experiences: pickedExperiences, narrative, itinerary, estimatedDailyRate: budget === "Premium" ? 35000 : budget === "Budget" ? 9000 : 18000, routeSlugs });
  } catch (error) {
    console.error("Concierge error", error);
    return NextResponse.json({ error: "Could not build your journey." }, { status: 500 });
  }
}
