"use client";

import { useEffect, useMemo, useState } from "react";

type Season = { id: string; name: string; starts_month: number; ends_month: number; notes: string | null };
type Destination = { id: string; slug: string; name: string; region: string; summary: string; best_time: string };

const fallbackSeasons: Season[] = [
  { id: "fallback-1", name: "Northeast Monsoon", starts_month: 12, ends_month: 2, notes: "A strong window for the south and west coast, with beach days and calmer sea conditions often favored." },
  { id: "fallback-2", name: "First Inter-Monsoon", starts_month: 3, ends_month: 4, notes: "Warm transition months with short afternoon showers; inland cultural and hill-country trips can work well." },
  { id: "fallback-3", name: "Southwest Monsoon", starts_month: 5, ends_month: 9, notes: "The southwest is wetter, making the east and north attractive for outdoor and beach plans." },
  { id: "fallback-4", name: "Second Inter-Monsoon", starts_month: 10, ends_month: 11, notes: "A greener transition period with occasional heavy showers across inland highlands." },
];

const recommendationMap: Record<string, string[]> = {
  "Northeast Monsoon": ["galle", "mirissa", "kandy", "ella"],
  "First Inter-Monsoon": ["sigiriya", "anuradhapura", "kandy", "ella"],
  "Southwest Monsoon": ["anuradhapura", "sigiriya", "ella", "kandy"],
  "Second Inter-Monsoon": ["ella", "nuwara-eliya", "kandy", "sigiriya"],
};

function seasonForMonth(month: number, seasons: Season[]) {
  return seasons.find((season) => {
    if (season.starts_month <= season.ends_month) return month >= season.starts_month && month <= season.ends_month;
    return month >= season.starts_month || month <= season.ends_month;
  }) ?? seasons[0];
}

export default function SeasonalIntelligence() {
  const [seasons, setSeasons] = useState<Season[]>(fallbackSeasons);
  const [destinations, setDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/events", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/destinations", { cache: "no-store" }).then((response) => response.json()),
    ]).then(([eventData, destinationData]) => {
      if (Array.isArray(eventData.seasons) && eventData.seasons.length) setSeasons(eventData.seasons);
      if (Array.isArray(destinationData.destinations)) setDestinations(destinationData.destinations);
    }).catch(() => {});
  }, []);

  const currentSeason = useMemo(() => seasonForMonth(new Date().getMonth() + 1, seasons), [seasons]);
  const recommended = (recommendationMap[currentSeason?.name ?? ""] ?? []).map((slug) => destinations.find((destination) => destination.slug === slug)).filter(Boolean) as Destination[];

  return (
    <section className="border-b border-black/5 bg-[#f1eee6] px-5 py-14 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_1.5fr] lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.2em] text-[#b27c1d]">Travel with the season</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Right now in Sri Lanka</h2>
          <p className="mt-4 max-w-xl leading-7 text-[#66756f]">{currentSeason?.notes ?? "Use the current season as a simple guide, then shape the rest of your route around your interests."}</p>
          <a href={`/events?season=${encodeURIComponent(currentSeason?.id ?? "")}`} className="mt-6 inline-block rounded-full bg-[#183d32] px-6 py-3 font-bold text-white">Explore this season →</a>
        </div>
        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">Current season</p><p className="mt-1 text-lg font-semibold">{currentSeason?.name ?? "Sri Lanka travel season"}</p></div>
            <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#183d32]">{new Date().toLocaleString("en-LK", { month: "long" })}</span>
          </div>
          {recommended.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {recommended.slice(0, 4).map((destination) => (
                <a key={destination.id} href={`/destinations/${destination.slug}`} className="rounded-2xl bg-white p-5 transition hover:-translate-y-0.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">{destination.region}</p>
                  <h3 className="mt-2 text-xl font-semibold">{destination.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#66756f]">{destination.summary}</p>
                  <p className="mt-3 text-xs font-semibold text-[#183d32]">Best time: {destination.best_time}</p>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-7 text-[#66756f]">Seasonal destination recommendations are loading.</div>
          )}
        </div>
      </div>
    </section>
  );
}
