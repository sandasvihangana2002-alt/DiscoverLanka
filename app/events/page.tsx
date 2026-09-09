"use client";

import { useEffect, useMemo, useState } from "react";

type Event = { id: string; name: string; description: string | null; location: string | null; starts_at: string | null; ends_at: string | null; official_source: string | null };
type Season = { id: string; name: string; months: string | null; notes: string | null };
type Destination = { id: string; slug: string; name: string; region: string; best_time: string | null; summary: string | null };

const fallbackSeasons: Season[] = [
  { id: "south-west", name: "South & west coast", months: "Nov – Apr", notes: "A classic window for the south and west coast, with warm beach days and easier coastal planning." },
  { id: "hill-country", name: "Hill country", months: "Year-round", notes: "Cooler temperatures make Kandy, Ella and Nuwara Eliya appealing across much of the year." },
  { id: "east-coast", name: "East coast", months: "May – Sep", notes: "A useful alternative when you want beaches and slower coastal days on the east side." },
  { id: "wildlife", name: "Wildlife escapes", months: "Season-aware", notes: "Wildlife conditions vary by park and month; check the latest park guidance before travelling." },
];

const seasonMatches: Record<string, string[]> = {
  "First Inter-Monsoon": ["sigiriya", "anuradhapura", "kandy", "ella"],
  "Northeast Monsoon": ["galle", "mirissa", "kandy", "ella"],
  "Second Inter-Monsoon": ["ella", "nuwara-eliya", "kandy", "sigiriya"],
  "Southwest Monsoon": ["anuradhapura", "sigiriya", "ella", "kandy"],
};

function formatDate(value: string | null) {
  if (!value) return "Date to be announced";
  return new Date(value).toLocaleDateString("en-LK", { dateStyle: "medium" });
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [seasons, setSeasons] = useState<Season[]>(fallbackSeasons);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/events", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/destinations", { cache: "no-store" }).then((response) => response.json()),
    ])
      .then(([eventData, destinationData]) => {
        setEvents(Array.isArray(eventData.events) ? eventData.events : []);
        if (Array.isArray(eventData.seasons) && eventData.seasons.length) setSeasons(eventData.seasons);
        setDestinations(Array.isArray(destinationData.destinations) ? destinationData.destinations : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedSeason && seasons[0]) setSelectedSeason(seasons[0].name);
  }, [seasons, selectedSeason]);

  const upcoming = useMemo(() => events.filter((event) => !event.starts_at || new Date(event.starts_at).getTime() >= Date.now()), [events]);
  const recommendedDestinations = useMemo(() => {
    const slugs = seasonMatches[selectedSeason] ?? [];
    const ordered = slugs.map((slug) => destinations.find((destination) => destination.slug === slug)).filter(Boolean) as Destination[];
    return [...ordered, ...destinations.filter((destination) => !slugs.includes(destination.slug))].slice(0, 4);
  }, [destinations, selectedSeason]);
  const activeSeason = seasons.find((season) => season.name === selectedSeason);

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#10251f]">
      <header className="border-b border-black/10 bg-[#f7f5ef]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="text-xl font-bold">Discover<span className="text-[#d9a441]">Lanka</span></a>
          <div className="flex items-center gap-4">
            <a href="/plan" className="hidden text-sm font-semibold text-[#66756f] sm:block">Plan →</a>
            <a href="/" className="rounded-full bg-[#183d32] px-5 py-2.5 text-sm font-bold text-white">Home</a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-14 pt-20 md:pt-24">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-[#b27c1d]">Events & seasons</p>
        <h1 className="mt-3 max-w-4xl text-5xl font-semibold tracking-[-.04em] md:text-7xl">Time your journey around the island.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#66756f]">Use the island's seasonal rhythm to choose regions, travel styles and experiences that fit your dates.</p>

        <section className="mt-14" aria-labelledby="seasons-heading">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#8d651d]">Travel rhythms</p>
              <h2 id="seasons-heading" className="mt-2 text-4xl font-semibold">Where the island shines.</h2>
            </div>
            {activeSeason && <p className="hidden max-w-md text-right text-sm leading-6 text-[#66756f] md:block">{activeSeason.notes}</p>}
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {seasons.map((season) => (
              <button key={season.id} type="button" onClick={() => setSelectedSeason(season.name)} className={`rounded-3xl p-7 text-left shadow-sm transition ${selectedSeason === season.name ? "bg-[#183d32] text-white ring-2 ring-[#d9a441]" : "bg-white hover:-translate-y-0.5"}`}>
                <p className={`text-sm font-bold uppercase tracking-widest ${selectedSeason === season.name ? "text-[#e7c36e]" : "text-[#b27c1d]"}`}>{season.months || "Season"}</p>
                <h3 className="mt-3 text-2xl font-semibold">{season.name}</h3>
                <p className={`mt-3 leading-7 ${selectedSeason === season.name ? "text-white/75" : "text-[#66756f]"}`}>{season.notes || "Explore this part of Sri Lanka at a pace that fits the season."}</p>
                <span className={`mt-5 inline-block text-xs font-bold uppercase tracking-widest ${selectedSeason === season.name ? "text-[#e7c36e]" : "text-[#8d651d]"}`}>{selectedSeason === season.name ? "Selected season" : "Choose season"}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-16" aria-labelledby="recommended-heading">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#8d651d]">Season-aware route</p>
              <h2 id="recommended-heading" className="mt-2 text-4xl font-semibold">Best matches for {activeSeason?.name || "this season"}.</h2>
            </div>
            {activeSeason?.months && <p className="text-sm font-semibold text-[#66756f]">Typical window: {activeSeason.months}</p>}
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recommendedDestinations.map((destination, index) => (
              <article key={destination.id} className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#183d32] text-sm font-bold text-white">{index + 1}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">{destination.region}</span>
                </div>
                <h3 className="mt-5 text-2xl font-semibold">{destination.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[#66756f]">Best time: {destination.best_time || "Season-aware"}</p>
                {destination.summary && <p className="mt-3 text-sm leading-6 text-[#66756f]">{destination.summary}</p>}
                <a href={`/plan?destination=${encodeURIComponent(destination.slug)}`} className="mt-5 inline-block text-sm font-bold text-[#183d32]">Start a trip here →</a>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20" aria-labelledby="events-heading">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.2em] text-[#8d651d]">What’s ahead</p>
            <h2 id="events-heading" className="mt-2 text-4xl font-semibold">Upcoming events.</h2>
          </div>
          <div className="mt-8">
            {loading ? (
              <div className="rounded-3xl bg-white p-8 text-[#66756f]">Loading event calendar…</div>
            ) : upcoming.length ? (
              <div className="grid gap-5 md:grid-cols-2">
                {upcoming.map((event) => (
                  <article key={event.id} className="rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
                    <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-widest text-[#8d651d]">
                      <span>{formatDate(event.starts_at)}</span>
                      {event.location && <span>· {event.location}</span>}
                    </div>
                    <h3 className="mt-3 text-2xl font-semibold">{event.name}</h3>
                    {event.description && <p className="mt-3 leading-7 text-[#66756f]">{event.description}</p>}
                    {event.ends_at && <p className="mt-4 text-sm text-[#66756f]">Through {formatDate(event.ends_at)}</p>}
                    {event.official_source && <a href={event.official_source} target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm font-bold text-[#183d32]">Official source ↗</a>}
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-[#e9e2d3] p-8">
                <h3 className="text-2xl font-semibold">The event calendar is being built.</h3>
                <p className="mt-3 max-w-2xl leading-7 text-[#66756f]">Seasonal guidance is already available above. Verified event dates will appear here as DiscoverLanka's calendar grows.</p>
              </div>
            )}
          </div>
        </section>

        <div className="mt-16 rounded-[2rem] bg-[#183d32] p-8 text-white md:p-10">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-[#e7c36e]">Build around your dates</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold md:text-4xl">Turn the right season into a real itinerary.</h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/70">Pick a season above, start from one of its recommended destinations, then let the Trip Builder shape the rest around your interests, budget and trip length.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={recommendedDestinations[0] ? `/plan?destination=${encodeURIComponent(recommendedDestinations[0].slug)}` : "/plan"} className="rounded-full bg-[#d9a441] px-6 py-3.5 font-bold text-[#10251f]">Plan this season →</a>
            <a href="/plan" className="rounded-full border border-white/30 px-6 py-3.5 font-bold text-white">Open Trip Builder</a>
          </div>
        </div>
      </section>
    </main>
  );
}
