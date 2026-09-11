"use client";

import { useEffect, useMemo, useState } from "react";


type Destination = {
  id: string;
  slug: string;
  name: string;
  region: string;
  summary: string;
  image: string;
  latitude: number;
  longitude: number;
  best_time?: string | null;
};
type Season = { id: string; name: string; starts_month: number; ends_month: number; notes: string | null };
type Event = { id: string; name: string; description: string | null; location: string | null; starts_at: string | null; ends_at: string | null; official_source: string | null };

type ScoreRow = { destination: Destination; score: number; reasons: string[] };
const interests = ["Mountains", "Coast", "Wildlife", "Culture", "Food", "Slow travel"];
const budgets = ["Budget", "Comfort", "Premium"];
const dayOptions = [3, 5, 7, 10, 14];
const dailyRates: Record<string, number> = { Budget: 9000, Comfort: 18000, Premium: 35000 };
const profiles: Record<string, { primary: string[]; secondary: string[] }> = {
  Mountains: { primary: ["ella", "nuwara-eliya", "kandy", "sigiriya"], secondary: ["galle", "yala", "mirissa"] },
  Coast: { primary: ["galle", "mirissa", "ella", "kandy"], secondary: ["sigiriya", "nuwara-eliya", "yala"] },
  Wildlife: { primary: ["yala", "ella", "kandy", "mirissa"], secondary: ["sigiriya", "nuwara-eliya", "galle"] },
  Culture: { primary: ["sigiriya", "kandy", "anuradhapura", "galle"], secondary: ["ella", "nuwara-eliya", "yala", "mirissa"] },
  Food: { primary: ["kandy", "galle", "mirissa", "ella"], secondary: ["sigiriya", "nuwara-eliya", "anuradhapura", "yala"] },
  "Slow travel": { primary: ["ella", "nuwara-eliya", "galle", "mirissa"], secondary: ["kandy", "sigiriya", "yala", "anuradhapura"] },
};

function addDays(value: string, amount: number) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function seasonForMonth(month: number, seasons: Season[]) {
  return seasons.find((s) => s.starts_month <= s.ends_month ? month >= s.starts_month && month <= s.ends_month : month >= s.starts_month || month <= s.ends_month) ?? seasons[0];
}
function eventHits(event: Event, start: string, end: string) {
  const a = event.starts_at ? new Date(event.starts_at).toISOString().slice(0, 10) : null;
  const b = event.ends_at ? new Date(event.ends_at).toISOString().slice(0, 10) : a;
  return Boolean(a && a <= end && (b ?? a) >= start);
}
function distanceKm(a: Destination, b: Destination) {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLon = (b.longitude - a.longitude) * rad;
  const lat1 = a.latitude * rad;
  const lat2 = b.latitude * rad;
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
function money(value: number) { return `LKR ${Math.round(value).toLocaleString("en-LK")}`; }

export default function Level4PlannerPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [days, setDays] = useState(7);
  const [travelers, setTravelers] = useState(2);
  const [interest, setInterest] = useState("Mountains");
  const [budget, setBudget] = useState("Comfort");
  const [startDate, setStartDate] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [generated, setGenerated] = useState<ScoreRow[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/destinations", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/events", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([d, e]) => {
      setDestinations(Array.isArray(d.destinations) ? d.destinations : []);
      setSeasons(Array.isArray(e.seasons) ? e.seasons : []);
      setEvents(Array.isArray(e.events) ? e.events : []);
    }).catch(() => setMessage("Planning data is temporarily unavailable. Try again in a moment."));
    try {
      const saved = JSON.parse(localStorage.getItem("discoverlanka-plan") ?? "{}");
      if (dayOptions.includes(saved.days)) setDays(saved.days);
      if (Number.isInteger(saved.travelers)) setTravelers(Math.max(1, Math.min(10, saved.travelers)));
      if (interests.includes(saved.interest)) setInterest(saved.interest);
      if (budgets.includes(saved.budget)) setBudget(saved.budget);
      if (typeof saved.startDate === "string") setStartDate(saved.startDate);
    } catch {}
  }, []);

  const season = useMemo(() => {
    if (!seasons.length) return null;
    const date = startDate ? new Date(`${startDate}T12:00:00`) : new Date();
    return seasonForMonth(date.getMonth() + 1, seasons);
  }, [seasons, startDate]);

  const activeEvents = useMemo(() => {
    if (!startDate) return [];
    const end = addDays(startDate, days - 1);
    return events.filter((event) => eventHits(event, startDate, end));
  }, [events, startDate, days]);

  const scored = useMemo(() => {
    const profile = profiles[interest] ?? profiles.Mountains;
    return destinations.map((destination) => {
      const primaryIndex = profile.primary.indexOf(destination.slug);
      const secondaryIndex = profile.secondary.indexOf(destination.slug);
      let score = primaryIndex >= 0 ? 88 - primaryIndex * 7 : secondaryIndex >= 0 ? 60 - secondaryIndex * 5 : 34;
      const reasons: string[] = [];
      if (primaryIndex >= 0) reasons.push("strong match for your travel style");
      if (secondaryIndex >= 0 && primaryIndex < 0) reasons.push("useful supporting stop");
      const notes = season?.notes ?? "";
      const coastal = ["galle", "mirissa"].includes(destination.slug);
      const eastNorth = ["yala", "sigiriya", "anuradhapura"].includes(destination.slug);
      if (coastal && /south|west/i.test(notes)) { score += 10; reasons.push("season notes favour this side of the island"); }
      if (eastNorth && /east|north/i.test(notes)) { score += 10; reasons.push("season notes favour this side of the island"); }
      if (destination.best_time && startDate) {
        const best = destination.best_time.toLowerCase();
        if (best.includes("year-round")) score += 3;
        if (/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/.test(best)) { score += 2; reasons.push("best-time metadata considered"); }
      }
      if (activeEvents.some((event) => (event.location ?? "").toLowerCase().includes(destination.name.toLowerCase()))) {
        score += 12;
        reasons.push("an event overlaps your dates here");
      }
      return { destination, score, reasons };
    }).sort((a, b) => b.score - a.score);
  }, [destinations, activeEvents, interest, season, startDate]);

  const route = useMemo(() => {
    const limit = days >= 10 ? 4 : days >= 7 ? 3 : 2;
    const seed = (selected.length ? selected.map((slug) => scored.find((x) => x.destination.slug === slug)).filter(Boolean) as ScoreRow[] : scored.slice(0, limit));
    const out: Destination[] = [];
    for (const row of seed) {
      if (!out.length) { out.push(row.destination); continue; }
      const nearest = out.reduce((best, item) => distanceKm(row.destination, item) < distanceKm(row.destination, best) ? item : best, out[0]);
      if (distanceKm(row.destination, nearest) < 380 || out.length < Math.min(limit, 2)) out.push(row.destination);
    }
    return out.slice(0, limit);
  }, [days, scored, selected]);

  const intelligence = useMemo(() => {
    const routeKm = route.slice(1).reduce((total, destination, index) => total + distanceKm(route[index], destination), 0);
    const maxBases = days <= 5 ? 2 : days <= 9 ? 3 : 4;
    const basePenalty = Math.max(0, route.length - maxBases) * 8;
    const eventBoost = activeEvents.length * 3;
    const pace = days / Math.max(1, route.length);
    const paceLabel = pace >= 3 ? "relaxed" : pace >= 2 ? "balanced" : "fast-moving";
    const confidence = Math.max(72, Math.min(98, Math.round(86 + eventBoost - basePenalty - routeKm / 550)));
    return { routeKm, pace, paceLabel, confidence };
  }, [activeEvents.length, days, route]);

  const estimate = useMemo(() => {
    const daily = dailyRates[budget] ?? dailyRates.Comfort;
    const base = daily * days * travelers;
    const movement = Math.max(1, route.length * 0.82);
    const accommodation = base * 0.42;
    const food = base * 0.23;
    const transport = base * 0.18 * movement;
    const activities = base * 0.17 * movement;
    return { accommodation, food, transport, activities, total: accommodation + food + transport + activities };
  }, [budget, days, travelers, route.length]);

  const generate = async () => {
    const start = startDate || new Date().toISOString().slice(0, 10);
    if (!route.length) return;
    setBusy(true); setMessage(""); setGenerated(route.map((destination) => scored.find((x) => x.destination.slug === destination.slug)!).filter(Boolean));
    localStorage.setItem("discoverlanka-plan-level4", JSON.stringify({ days, travelers, interest, budget, startDate: start, route: route.map((d) => d.slug), confidence: intelligence.confidence }));
    try {
      const tripResponse = await fetch("/api/trips", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: `Smart Sri Lanka ${days}-day ${interest} journey`, days, travelers, interest, budgetLevel: budget, budgetEstimate: estimate.total, startDate: startDate || null, endDate: startDate ? addDays(startDate, days - 1) : null, selectedSlugs: route.map((d) => d.slug), itinerary: route.map((destination, index) => ({ day: index + 1, destination: destination.name, date: addDays(start, Math.min(index * Math.max(1, Math.floor(days / route.length)), days - 1)) })), events: activeEvents }) });
      if (!tripResponse.ok) throw new Error("Trip save failed");
      const tripData = await tripResponse.json();
      const tripId = String(tripData.trip.id);
      const itineraryResponse = await fetch("/api/itineraries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tripId, title: `${days}-day ${interest} level 4 itinerary`, summary: `${intelligence.confidence}% route confidence · ${intelligence.paceLabel} pace · ${route.length} bases.`, durationDays: days, budgetLevel: budget, content: { route: route.map((d) => d.slug), routeKm: intelligence.routeKm, confidence: intelligence.confidence, pace: intelligence.paceLabel, season: season?.name ?? null, events: activeEvents } }) });
      if (!itineraryResponse.ok) throw new Error("Itinerary save failed");
      localStorage.setItem("discoverlanka-trip-id", tripId);
      if (tripData.trip.share_token) localStorage.setItem("discoverlanka-share-token", String(tripData.trip.share_token));
      setMessage("Level 4 smart route saved to your live trip.");
    } catch { setMessage("Level 4 route is ready in this browser. Server sync is unavailable right now."); }
    setBusy(false);
  };

  return (
    <main className="min-h-screen bg-[#07120f] px-5 py-28 text-[#f4efe6] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#d8b875]">TRIP PLANNER · INTELLIGENCE LEVEL 4</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-[-.04em] md:text-7xl">A smarter route, not a longer checklist.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/60">Level 4 weighs your interests, trip length, season, events and route distance before it builds the route.</p>
          </div>
          <a href="/plan" className="inline-flex w-fit rounded-full border border-white/15 bg-white/[.05] px-5 py-3 text-sm font-semibold">Back to classic planner ↗</a>
        </div>

        <section className="mt-10 grid gap-4 lg:grid-cols-5">
          {[["Trip length", <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm outline-none">{dayOptions.map((value) => <option key={value} value={value}>{value} days</option>)}</select>], ["Travelers", <input type="number" min={1} max={10} value={travelers} onChange={(e) => setTravelers(Math.max(1, Math.min(10, Number(e.target.value) || 1)))} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm outline-none" />], ["Main feeling", <select value={interest} onChange={(e) => setInterest(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm outline-none">{interests.map((value) => <option key={value}>{value}</option>)}</select>], ["Budget", <select value={budget} onChange={(e) => setBudget(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm outline-none">{budgets.map((value) => <option key={value}>{value}</option>)}</select>], ["Start date", <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm outline-none" />]].map(([label, field]) => <label key={String(label)} className="rounded-[1.5rem] border border-white/10 bg-white/[.035] p-5 text-sm font-semibold">{label}{field}</label>)}
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div><p className="text-xs uppercase tracking-[.18em] text-white/40">Route intelligence</p><h2 className="mt-2 text-2xl font-semibold">{route.length} bases · {Math.round(intelligence.routeKm)} km between main stops</h2></div>
              <div className="rounded-full bg-[#d8b875] px-4 py-2 text-xs font-bold text-[#0b1712]">{intelligence.confidence}% confidence</div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {route.map((destination, index) => <button key={destination.slug} onClick={() => setSelected((current) => current.includes(destination.slug) ? current.filter((x) => x !== destination.slug) : [...current, destination.slug])} className={`rounded-2xl border p-4 text-left ${selected.includes(destination.slug) ? "border-[#d8b875] bg-[#d8b875]/10" : "border-white/10 bg-white/[.025]"}`}><div className="text-xs uppercase tracking-widest text-[#d8b875]">Stop {index + 1}</div><div className="mt-2 text-lg font-semibold">{destination.name}</div><div className="mt-1 text-sm text-white/50">{destination.region}</div></button>)}
            </div>
            <button disabled={busy || !route.length} onClick={generate} className="mt-6 inline-flex rounded-full bg-[#d8b875] px-6 py-3 text-sm font-bold text-[#0b1712] disabled:opacity-50">{busy ? "Building…" : "Build Level 4 trip ↗"}</button>
            {message && <p className="mt-4 text-sm text-white/60">{message}</p>}
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6">
              <p className="text-xs uppercase tracking-[.18em] text-white/40">Why this route</p>
              <div className="mt-4 space-y-4">{scored.slice(0, 4).map((row) => <div key={row.destination.slug} className="border-b border-white/8 pb-4 last:border-0"><div className="flex items-center justify-between gap-4"><span className="font-semibold">{row.destination.name}</span><span className="text-xs font-bold text-[#d8b875]">{Math.round(row.score)}</span></div><p className="mt-1 text-sm leading-6 text-white/48">{row.reasons.slice(0, 2).join(" · ") || "balanced destination fit"}</p></div>)}</div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6">
              <p className="text-xs uppercase tracking-[.18em] text-white/40">Trip shape</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-white/[.035] p-4"><span className="text-white/40">Pace</span><div className="mt-1 font-semibold capitalize">{intelligence.paceLabel}</div></div><div className="rounded-2xl bg-white/[.035] p-4"><span className="text-white/40">Season</span><div className="mt-1 font-semibold">{season?.name ?? "Auto"}</div></div><div className="rounded-2xl bg-white/[.035] p-4"><span className="text-white/40">Events</span><div className="mt-1 font-semibold">{activeEvents.length || "None"}</div></div><div className="rounded-2xl bg-white/[.035] p-4"><span className="text-white/40">Estimate</span><div className="mt-1 font-semibold">{money(estimate.total)}</div></div></div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[.025] p-6 md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs uppercase tracking-[.18em] text-white/40">Budget intelligence</p><h2 className="mt-2 text-2xl font-semibold">A realistic working range</h2></div><span className="text-sm text-white/45">{travelers} {travelers === 1 ? "traveler" : "travelers"} · {days} days · {budget}</span></div>
          <div className="mt-6 grid gap-3 md:grid-cols-4">{[["Stay", estimate.accommodation], ["Food", estimate.food], ["Transport", estimate.transport], ["Activities", estimate.activities]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-white/8 bg-white/[.025] p-4"><div className="text-sm text-white/45">{label}</div><div className="mt-2 font-semibold">{money(Number(value))}</div></div>)}</div>
        </section>

        {activeEvents.length > 0 && <section className="mt-6 rounded-[2rem] border border-[#d8b875]/20 bg-[#d8b875]/[.05] p-6"><p className="text-xs uppercase tracking-[.18em] text-[#d8b875]">Calendar-aware bonus</p><h2 className="mt-2 text-2xl font-semibold">Your dates overlap {activeEvents.length} event{activeEvents.length === 1 ? "" : "s"}.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">The route score includes these events so your plan can leave space for local moments instead of treating every day the same.</p></section>}
      </div>
    </main>
  );
}
