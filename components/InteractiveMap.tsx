"use client";

import { useMemo, useState } from "react";

type Destination = {
  id: string;
  name: string;
  region: string;
  summary: string;
  latitude?: number;
  longitude?: number;
  slug: string;
};

const categories = ["All", "Beach", "Mountains", "Wildlife", "Culture", "Adventure"] as const;
type Category = (typeof categories)[number];

const categoryBySlug: Record<string, Category> = {
  kandy: "Culture",
  sigiriya: "Culture",
  anuradhapura: "Culture",
  polonnaruwa: "Culture",
  dambulla: "Culture",
  mihintale: "Culture",
  yapahuwa: "Culture",
  jaffna: "Culture",
  ella: "Mountains",
  "nuwara-eliya": "Mountains",
  "adams-peak": "Mountains",
  "horton-plains": "Mountains",
  knuckles: "Mountains",
  riverston: "Mountains",
  haputale: "Mountains",
  yala: "Wildlife",
  udawalawe: "Wildlife",
  wilpattu: "Wildlife",
  sinharaja: "Wildlife",
  mirissa: "Beach",
  galle: "Culture",
  bentota: "Beach",
  hikkaduwa: "Beach",
  nilaveli: "Beach",
  pasikuda: "Beach",
  batticaloa: "Beach",
  trincomalee: "Beach",
  "arugam-bay": "Adventure",
  kalpitiya: "Adventure",
  kitulgala: "Adventure",
  "delft-island": "Beach",
  mannar: "Beach",
};

const recommendedSlugs = ["ella", "kandy", "sigiriya", "yala"];

export default function InteractiveMap({ destinations }: { destinations: Destination[] }) {
  const [selected, setSelected] = useState<Destination | null>(null);
  const [route, setRoute] = useState<string[]>([]);
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return destinations.filter((d) => {
      const matchesCategory = category === "All" || (categoryBySlug[d.slug] ?? "Culture") === category;
      const matchesQuery = !q || d.name.toLowerCase().includes(q) || d.region.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [destinations, category, query]);

  const recommended = useMemo(
    () =>
      recommendedSlugs
        .map((slug) => destinations.find((d) => d.slug === slug))
        .filter(Boolean) as Destination[],
    [destinations]
  );

  const selectedStops = useMemo(
    () => route.map((slug) => destinations.find((d) => d.slug === slug)).filter(Boolean) as Destination[],
    [route, destinations]
  );

  const mapBounds = { minLon: 79.5, maxLon: 82.2, minLat: 5.8, maxLat: 9.9 };
  const mapSrc =
    "https://www.openstreetmap.org/export/embed.html?bbox=79.5%2C5.8%2C82.2%2C9.9&layer=mapnik";

  function toggleRoute(d: Destination) {
    setRoute((current) =>
      current.includes(d.slug) ? current.filter((slug) => slug !== d.slug) : [...current, d.slug]
    );
  }

  function focusDestination(d: Destination) {
    setSelected(d);
  }

  return (
    <div className="luxury-map relative min-h-[650px] w-full overflow-hidden bg-[#e8e1d4]">
      <iframe
        title="Sri Lanka destination map"
        src={mapSrc}
        className="absolute inset-0 h-full w-full border-0 grayscale-[.38] contrast-[1.02] saturate-[.7]"
        loading="lazy"
      />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,18,14,.08) 0%, rgba(7,18,14,.02) 45%, rgba(7,18,14,.12) 100%), radial-gradient(circle at 50% 48%, transparent 22%, rgba(4,16,11,.18) 100%)",
        }}
      />

      <div className="absolute inset-x-4 top-4 z-20 sm:inset-x-5 sm:top-5">
        <div className="mx-auto max-w-5xl rounded-[1.35rem] border border-[#ffffff]/70 bg-[#fbf8f1]/95 p-2 shadow-[0_16px_50px_rgba(30,36,29,.12)] backdrop-blur-xl">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-[#10251f] text-[#e4c57f]">
                <span className="text-lg">⌕</span>
              </div>
              <input
                aria-label="Search destinations"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a destination or region..."
                className="h-11 min-w-0 flex-1 bg-transparent px-1 text-sm font-medium text-[#17251f] outline-none placeholder:text-[#7a827a]"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto px-1 pb-1 lg:pb-0">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-[9px] font-black uppercase tracking-[.16em] transition ${category === item ? "bg-[#10251f] text-[#f8f4ea]" : "text-[#6d756e] hover:bg-[#eee9df]"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute left-4 top-[110px] z-10 sm:left-5 lg:top-[95px]">
        <div className="w-[min(300px,calc(100vw-2rem))] rounded-[1.6rem] border border-white/15 bg-[#0b1c15]/90 p-4 text-white shadow-[0_18px_55px_rgba(0,0,0,.2)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.22em] text-[#d9b972]">Explore the island</p>
              <p className="mt-1 text-xs leading-5 text-white/55">
                {filtered.length} {filtered.length === 1 ? "place" : "places"} on the map
              </p>
            </div>
            {route.length > 0 && (
              <button
                onClick={() => setRoute([])}
                className="text-[9px] font-black uppercase tracking-[.16em] text-[#d9b972]"
              >
                Clear route
              </button>
            )}
          </div>

          <div className="mt-4 max-h-[265px] space-y-1.5 overflow-auto pr-1">
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                No matching places found.
              </div>
            ) : (
              filtered.map((d, index) => (
                <button
                  key={d.id}
                  onClick={() => focusDestination(d)}
                  className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${selected?.slug === d.slug ? "border-[#d9b972]/45 bg-white/8" : "border-white/6 bg-white/[.025] hover:border-white/12 hover:bg-white/[.05]"}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-[9px] font-black text-[#d9b972]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white/95">{d.name}</span>
                    <span className="mt-0.5 block truncate text-[10px] uppercase tracking-[.12em] text-white/35">
                      {d.region}
                    </span>
                  </span>
                  <span className="text-[#d9b972] transition group-hover:translate-x-0.5">↗</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="absolute right-4 top-[110px] z-10 sm:right-5 lg:top-[95px]">
        <button
          onClick={() => setShowRecommendations((current) => !current)}
          className="rounded-full border border-white/15 bg-[#0b1c15]/88 px-4 py-2.5 text-[9px] font-black uppercase tracking-[.18em] text-[#e4c57f] shadow-lg backdrop-blur-xl"
        >
          {showRecommendations ? "Hide recommendations" : "Recommended for you"}
        </button>

        {showRecommendations && (
          <div className="mt-2 hidden w-[270px] rounded-[1.6rem] border border-white/12 bg-[#0b1c15]/92 p-3 shadow-[0_18px_55px_rgba(0,0,0,.2)] backdrop-blur-xl sm:block">
            <p className="px-2 py-1 text-[9px] font-black uppercase tracking-[.22em] text-white/38">
              A considered edit
            </p>
            <div className="mt-2 space-y-1.5">
              {recommended.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[.025] p-2.5"
                >
                  <button onClick={() => focusDestination(d)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#d9b972] shadow-[0_0_0_4px_rgba(217,185,114,.10)]" />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-white">{d.name}</span>
                      <span className="mt-0.5 block text-[9px] uppercase tracking-[.13em] text-white/35">
                        {categoryBySlug[d.slug] ?? "Culture"}
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => toggleRoute(d)}
                    className={`text-[10px] font-black ${route.includes(d.slug) ? "text-[#d9b972]" : "text-white/35 hover:text-white/70"}`}
                    aria-label={route.includes(d.slug) ? `Remove ${d.name} from route` : `Add ${d.name} to route`}
                  >
                    {route.includes(d.slug) ? "✓" : "+"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 sm:bottom-5 sm:right-5">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#0b1c15]/88 text-white shadow-lg backdrop-blur-xl"
          aria-label="Reset map view"
          title="Reset map view"
        >
          ↺
        </button>
        <div className="rounded-full border border-white/15 bg-[#0b1c15]/88 px-3 py-2 text-[9px] font-black uppercase tracking-[.15em] text-white/55 shadow-lg backdrop-blur-xl">
          Tap a pin to explore
        </div>
      </div>

      {destinations.map((d) => {
        const latitude = d.latitude ?? 7.8731;
        const longitude = d.longitude ?? 80.7718;
        const left = ((longitude - mapBounds.minLon) / (mapBounds.maxLon - mapBounds.minLon)) * 100;
        const top = (1 - (latitude - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
        const isVisible = filtered.some((item) => item.slug === d.slug);

        return (
          <button
            key={d.id}
            onClick={() => focusDestination(d)}
            style={{ left: `${left}%`, top: `${top}%` }}
            aria-label={`Open ${d.name}`}
            className={`luxury-map-marker pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-full transition-opacity ${isVisible ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <span className="block h-4 w-4 rounded-full border-[3px] border-white bg-[#caa24f] shadow-[0_4px_12px_rgba(38,28,10,.35)] transition duration-300 hover:scale-125" />
            <span className="pointer-events-none absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-white/12 bg-[#0b1c15]/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.13em] text-white shadow-xl backdrop-blur group-hover:block">
              {d.name}
            </span>
          </button>
        );
      })}

      {selected && (
        <div className="absolute bottom-4 left-4 z-30 w-[min(390px,calc(100vw-2rem))] rounded-[1.7rem] border border-white/12 bg-[#0b1c15]/95 p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,.28)] backdrop-blur-xl sm:bottom-5 sm:left-5">
          <button
            onClick={() => setSelected(null)}
            className="absolute right-4 top-3 text-lg text-white/40 transition hover:text-white"
            aria-label="Close destination details"
          >
            ×
          </button>
          <div className="flex items-center gap-3 pr-8">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9b972]/25 bg-[#d9b972]/10 text-[#e4c57f]">
              ◆
            </span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.2em] text-[#d9b972]">
                {categoryBySlug[selected.slug] ?? "Culture"} · {selected.region}
              </p>
              <h3 className="mt-1 font-serif text-3xl tracking-[-.02em]">{selected.name}</h3>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/60">{selected.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => toggleRoute(selected)}
              className="rounded-full border border-white/12 bg-white/[.04] px-4 py-2.5 text-[10px] font-black uppercase tracking-[.14em] text-white transition hover:bg-white/[.08]"
            >
              {route.includes(selected.slug) ? "Remove from My Trip" : "Add to My Trip"}
            </button>
            <a
              href={`/destinations/${selected.slug}`}
              className="rounded-full bg-[#e3bd78] px-4 py-2.5 text-[10px] font-black uppercase tracking-[.14em] text-[#102018]"
            >
              Explore place ↗
            </a>
          </div>
        </div>
      )}

      {route.length > 0 && (
        <div className="absolute bottom-4 right-4 z-30 hidden w-[320px] rounded-[1.5rem] border border-[#d9b972]/20 bg-[#0b1c15]/94 p-4 text-white shadow-[0_24px_65px_rgba(0,0,0,.25)] backdrop-blur-xl sm:block lg:bottom-5 lg:right-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.2em] text-[#d9b972]">Your map list</p>
              <p className="mt-1 text-xs text-white/45">{route.length} {route.length === 1 ? "place" : "places"} saved</p>
            </div>
            <span className="text-xs text-[#d9b972]">↗</span>
          </div>
          <p className="mt-3 text-sm font-semibold leading-6 text-white/90">{selectedStops.map((d) => d.name).join(" → ")}</p>
          <a
            href="/plan"
            className="mt-3 inline-flex rounded-full border border-white/12 px-4 py-2 text-[9px] font-black uppercase tracking-[.16em] text-white/70 transition hover:border-[#d9b972]/40 hover:text-white"
          >
            Continue in My Trip
          </a>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 rounded-full border border-white/60 bg-[#f9f6ef]/90 px-4 py-2 text-[9px] font-black uppercase tracking-[.18em] text-[#4e5851] shadow-lg backdrop-blur-xl md:block">
        {category === "All" ? "Sri Lanka · curated destinations" : `Sri Lanka · ${category.toLowerCase()}`}
      </div>
    </div>
  );
}
