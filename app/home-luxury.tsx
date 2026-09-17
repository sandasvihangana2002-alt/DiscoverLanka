"use client";

import { useEffect, useMemo, useState } from "react";
import InteractiveMap from "@/components/InteractiveMapClient";

type Destination = {
  id: string;
  name: string;
  region: string;
  summary: string;
  slug: string;
  latitude?: number;
  longitude?: number;
};

type Experience = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  summary: string | null;
};

type Story = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
};

const destinationImages: Record<string, string> = {
  kandy: "/hero-home.jpg",
  ella: "https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=1800&q=90",
  galle: "https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=1800&q=90",
  sigiriya: "https://images.unsplash.com/photo-1588598198321-9735fd5246b8?auto=format&fit=crop&w=1800&q=90",
  yala: "https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=1800&q=90",
  mirissa: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1800&q=90",
  "nuwara-eliya": "https://images.unsplash.com/photo-1590123221594-8c5d2c5f3f44?auto=format&fit=crop&w=1800&q=90",
  anuradhapura: "https://images.unsplash.com/photo-1588258524675-c7f1e3e8d5d8?auto=format&fit=crop&w=1800&q=90",
  trincomalee: "https://images.unsplash.com/photo-1603398749944-1e39e3adf9e2?auto=format&fit=crop&w=1800&q=90",
  "arugam-bay": "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1800&q=90",
  jaffna: "https://images.unsplash.com/photo-1599839577407-2a7cecb2af47?auto=format&fit=crop&w=1800&q=90",
  udawalawe: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1800&q=90",
};

const experienceImages: Record<string, string> = {
  adventure: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1600&q=90",
  culture: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=90",
  nature: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1600&q=90",
  wellness: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=90",
  food: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1600&q=90",
};

const storyImages = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1500&q=88",
  "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=1500&q=88",
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1500&q=88",
];

const fallbackDestinations: Destination[] = [
  { id: "d1", slug: "kandy", name: "Kandy", region: "Central Province", summary: "Lake mornings, temple heritage and the soft rhythm of the hills." },
  { id: "d2", slug: "ella", name: "Ella", region: "Uva Province", summary: "Tea country, misty ridges and slow days between the peaks." },
  { id: "d3", slug: "sigiriya", name: "Sigiriya", region: "Central Province", summary: "Ancient stone, sunrise views and a sense of scale that stays with you." },
  { id: "d4", slug: "yala", name: "Yala", region: "Southern Province", summary: "Wildlife, dry-zone landscapes and dawns that begin before the heat." },
  { id: "d5", slug: "galle", name: "Galle", region: "Southern Province", summary: "Fort walls, ocean light and an elegant southern pace." },
  { id: "d6", slug: "mirissa", name: "Mirissa", region: "Southern Province", summary: "Beach afternoons, sea air and unhurried coastal evenings." },
  { id: "d7", slug: "nuwara-eliya", name: "Nuwara Eliya", region: "Central Province", summary: "Cool air, tea estates and a greener highland mood." },
  { id: "d8", slug: "anuradhapura", name: "Anuradhapura", region: "North Central Province", summary: "Sacred cities, ancient reservoirs and monumental quiet." },
];

const fallbackExperiences: Experience[] = [
  { id: "e1", slug: "wild-sri-lanka", name: "Wild Sri Lanka", category: "Nature", summary: "Dawn safaris, forest edges and a closer look at the island's wild side." },
  { id: "e2", slug: "temple-and-tea", name: "Temple & Tea", category: "Culture", summary: "Move from living heritage into the cool, cultivated hills." },
  { id: "e3", slug: "coast-at-dusk", name: "Coast at Dusk", category: "Adventure", summary: "Golden-hour roads, ocean air and a slower southern rhythm." },
  { id: "e4", slug: "slow-escape", name: "Slow Escape", category: "Wellness", summary: "Tea, quiet stays and space to let the journey breathe." },
  { id: "e5", slug: "food-and-flavour", name: "Food & Flavour", category: "Food", summary: "Markets, kitchens and memorable meals shaped by place." },
];

const fallbackStories: Story[] = [
  { id: "s1", slug: "kandy-in-a-day", title: "Kandy in a day", excerpt: "A calmer way to move through the hill capital without racing the clock.", category: "Journal" },
  { id: "s2", slug: "ella-beyond-the-viewpoints", title: "Ella beyond the viewpoints", excerpt: "Tea trails, small roads and the quiet moments between the famous stops.", category: "Field Notes" },
  { id: "s3", slug: "wildlife-with-care", title: "Wildlife with care", excerpt: "How to experience Sri Lanka's wild places with a lighter footprint.", category: "Guide" },
];

const seasonByMonth = [
  "Northeast Monsoon",
  "Northeast Monsoon",
  "First Inter-Monsoon",
  "First Inter-Monsoon",
  "Southwest Monsoon",
  "Southwest Monsoon",
  "Southwest Monsoon",
  "Southwest Monsoon",
  "Southwest Monsoon",
  "Second Inter-Monsoon",
  "Second Inter-Monsoon",
  "Northeast Monsoon",
];

const seasonNotes: Record<string, string> = {
  "Northeast Monsoon": "South and west coast escapes pair beautifully with cultural stays and hill-country mornings.",
  "First Inter-Monsoon": "Warm transition months are well suited to heritage, hills and flexible day plans.",
  "Southwest Monsoon": "The east and north can offer a drier change of scene while the southwest turns greener.",
  "Second Inter-Monsoon": "A lush shoulder season for slower routes, with room for flexible weather planning.",
};

const experienceCategories = ["Adventure", "Culture", "Nature", "Wellness", "Food"];

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export default function Home() {
  const [destinations, setDestinations] = useState<Destination[]>(fallbackDestinations);
  const [experiences, setExperiences] = useState<Experience[]>(fallbackExperiences);
  const [stories, setStories] = useState<Story[]>(fallbackStories);
  const [saved, setSaved] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dataState, setDataState] = useState<"loading" | "live" | "fallback">("loading");

  useEffect(() => {
    const getJson = async (url: string) => {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`${url} returned ${response.status}`);
      return response.json();
    };

    Promise.allSettled([getJson("/api/destinations"), getJson("/api/experiences"), getJson("/api/stories")]).then((results) => {
      const [destinationResult, experienceResult, storyResult] = results;
      let liveRows = 0;

      if (destinationResult.status === "fulfilled" && Array.isArray(destinationResult.value.destinations) && destinationResult.value.destinations.length) {
        setDestinations(destinationResult.value.destinations);
        liveRows += 1;
      }
      if (experienceResult.status === "fulfilled" && Array.isArray(experienceResult.value.experiences) && experienceResult.value.experiences.length) {
        setExperiences(experienceResult.value.experiences);
        liveRows += 1;
      }
      if (storyResult.status === "fulfilled" && Array.isArray(storyResult.value.stories) && storyResult.value.stories.length) {
        setStories(storyResult.value.stories);
        liveRows += 1;
      }

      setDataState(liveRows === 3 ? "live" : "fallback");
    });

    try {
      const stored = JSON.parse(localStorage.getItem("discoverlanka-saved") ?? "[]");
      if (Array.isArray(stored)) setSaved(stored.filter((value): value is string => typeof value === "string"));
    } catch {
      setSaved([]);
    }
  }, []);

  function toggleSaved(slug: string) {
    setSaved((current) => {
      const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
      localStorage.setItem("discoverlanka-saved", JSON.stringify(next));
      return next;
    });
  }

  const mapDestinations = useMemo(
    () => destinations.map((destination) => ({ ...destination, latitude: destination.latitude ?? 7.8731, longitude: destination.longitude ?? 80.7718 })),
    [destinations]
  );

  const featured = destinations.find((destination) => destination.slug === "kandy") ?? destinations[0];
  const signature = [
    destinations.find((destination) => destination.slug === "sigiriya"),
    destinations.find((destination) => destination.slug === "ella"),
    destinations.find((destination) => destination.slug === "yala"),
  ].filter(Boolean) as Destination[];
  const destinationCards = destinations.filter((destination) => destination.slug !== featured?.slug).slice(0, 6);
  const experienceCards = experienceCategories.map((category) => experiences.find((experience) => experience.category?.toLowerCase() === category.toLowerCase()) ?? experiences.find((experience) => experience.name.toLowerCase().includes(category.toLowerCase()))).filter(Boolean) as Experience[];
  const visibleStories = stories.slice(0, 3);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentSeason = seasonByMonth[currentMonth];
  const currentMonthLabel = now.toLocaleString("en-LK", { month: "long" });

  return (
    <main className="luxury-home min-h-screen bg-[#07120f] text-[#f4efe6]">
      <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between luxury-nav bg-[#06110d]/65">
          <a href="#top" className="brand-mark">Discover<span>Lanka</span></a>
          <nav className="hidden items-center gap-7 text-[11px] font-semibold uppercase tracking-[.17em] lg:flex">
            <a className="luxury-nav-link" href="#discover">Discover</a>
            <a className="luxury-nav-link" href="/destinations">Destinations</a>
            <a className="luxury-nav-link" href="/experiences">Experiences</a>
            <a className="luxury-nav-link" href="/stories">Stories</a>
            <a className="luxury-nav-link" href="/plan">Plan</a>
            <a className="luxury-nav-link" href="#map">Map</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="/search" className="luxury-icon-button" aria-label="Search">⌕</a>
            <a href="/plan" className="hidden luxury-pill luxury-pill-gold sm:inline-flex">Build my trip <span>↗</span></a>
            <button className="luxury-icon-button lg:hidden" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation">{menuOpen ? "×" : "☰"}</button>
          </div>
        </div>
        {menuOpen && (
          <div className="mx-auto mt-2 max-w-7xl luxury-mobile-nav lg:hidden">
            <a href="#discover" onClick={() => setMenuOpen(false)}>Discover</a>
            <a href="/destinations">Destinations</a>
            <a href="/experiences">Experiences</a>
            <a href="/stories">Stories</a>
            <a href="/plan">Plan</a>
            <a href="#map" onClick={() => setMenuOpen(false)}>Map</a>
          </div>
        )}
      </header>

      <section id="top" className="luxury-section luxury-hero relative min-h-[94svh] overflow-hidden">
        <img src="/hero-home.jpg" alt="Kandy Lake, Sri Lanka" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,13,9,.82)_0%,rgba(4,15,11,.52)_42%,rgba(5,16,12,.12)_77%,rgba(5,16,12,.05)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_32%,rgba(220,190,122,.12),transparent_22%)]" />

        <div className="relative mx-auto flex min-h-[94svh] max-w-7xl flex-col justify-end px-6 pb-7 pt-36 sm:px-8 lg:px-10 lg:pb-10">
          <div className="max-w-4xl">
            <p className="luxury-kicker text-[#d8b875]">Sri Lanka · {currentMonthLabel} · {dataState === "live" ? "live guide" : "curated guide"}</p>
            <h1 className="luxury-display mt-5 max-w-4xl text-[4rem] sm:text-7xl md:text-8xl lg:text-[7.2rem]">A slower,<br /><span className="text-[#e3c688]">richer Sri Lanka.</span></h1>
            <p className="mt-7 max-w-2xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">Discover places with soul, experiences with meaning, and a journey designed around the way you want to feel.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/plan" className="luxury-pill luxury-pill-gold">Build my trip <span>↗</span></a>
              <a href="#discover" className="luxury-pill luxury-pill-outline">Explore the island <span>↓</span></a>
            </div>
          </div>

          <div className="mt-12 grid gap-3 md:grid-cols-[1.15fr_1fr_1fr]">
            <div className="luxury-glass rounded-[1.5rem] border border-white/10 p-5">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="luxury-kicker text-[#d8b875]">Travel with the season</p>
                  <p className="mt-2 luxury-serif text-2xl">{currentSeason}</p>
                  <p className="mt-2 max-w-lg text-xs leading-6 text-white/55">{seasonNotes[currentSeason]}</p>
                </div>
                <span className="luxury-chip">{currentMonthLabel}</span>
              </div>
            </div>
            <div className="luxury-glass rounded-[1.5rem] border border-white/10 p-5">
              <p className="luxury-kicker text-white/45">On DiscoverLanka</p>
              <p className="mt-3 luxury-serif text-2xl">Curated, not crowded.</p>
              <p className="mt-2 text-xs leading-6 text-white/55">A calmer travel guide focused on places, people and moments.</p>
            </div>
            <div className="luxury-glass rounded-[1.5rem] border border-white/10 p-5">
              <p className="luxury-kicker text-white/45">Your next move</p>
              <a href="/plan" className="mt-3 inline-flex items-center gap-2 luxury-serif text-2xl text-white">Shape your route <span className="text-[#d8b875]">↗</span></a>
              <p className="mt-2 text-xs leading-6 text-white/55">Choose a feeling, then let the island do the rest.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="discover" className="luxury-section border-t border-white/[.07] px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="luxury-kicker text-[#d8b875]">The island, refined</p>
              <h2 className="luxury-display mt-4 text-4xl sm:text-6xl">Places worth<br />staying for.</h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">Skip the checklist. Follow the places that make you want to slow down, look closer and stay one more night.</p>
            </div>
            <a href="/destinations" className="luxury-pill luxury-pill-outline self-start md:self-auto">View all destinations <span>↗</span></a>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-[1.15fr_1fr_1fr]">
            {signature.map((destination, index) => (
              <a key={destination.id} href={`/destinations/${destination.slug}`} className={`group relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#0d211a] ${index === 0 ? "min-h-[540px] lg:row-span-2" : "min-h-[258px]"}`}>
                <img src={destinationImages[destination.slug] ?? destinationImages.kandy} alt={destination.name} className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-[1.045]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06110d] via-[#06110d]/40 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 text-white sm:inset-x-6 sm:bottom-6">
                  <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[.18em] text-[#e1c17c]"><span>0{index + 1}</span><span>{destination.region}</span></div>
                  <h3 className="luxury-serif mt-3 text-3xl sm:text-4xl">{destination.name}</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-white/65">{destination.summary}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-white/75">Explore <span>↗</span></div>
                </div>
              </a>
            ))}
            <div className="luxury-glass rounded-[1.7rem] border border-white/10 p-6 lg:col-span-2">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="luxury-kicker text-white/45">A personal shortlist</p>
                  <p className="luxury-serif mt-2 text-2xl">Save places as you wander.</p>
                  <p className="mt-2 max-w-xl text-xs leading-6 text-white/50">Keep a private collection while you explore. Your saved places are remembered on this device.</p>
                </div>
                <a href="/my-trip" className="luxury-pill luxury-pill-outline">Open my trip <span>↗</span></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-section border-y border-white/[.07] bg-[#081712] px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[280px_1fr]">
          <div>
            <p className="luxury-kicker text-[#d8b875]">Travel by feeling</p>
            <h2 className="luxury-display mt-4 text-4xl sm:text-5xl">Choose your<br />kind of day.</h2>
            <p className="mt-5 text-sm leading-7 text-white/50">From wild mornings to long lunches, let the feeling lead and the itinerary follow.</p>
            <a href="/experiences" className="mt-7 inline-flex text-xs font-bold uppercase tracking-[.17em] text-[#d8b875]">Explore experiences ↗</a>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {experienceCards.slice(0, 5).map((experience, index) => {
              const key = experience.category?.toLowerCase() ?? experience.name.toLowerCase();
              const image = experienceImages[key] ?? experienceImages[experience.name.toLowerCase().split(" ")[0]] ?? experienceImages.adventure;
              return (
                <a key={experience.id} href={`/experiences/${experience.slug}`} className="luxury-experience-card group relative min-h-[275px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0c1e17] p-5">
                  <img src={image} alt={experience.name} className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-700 group-hover:scale-105 group-hover:opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06110d] via-[#06110d]/55 to-[#06110d]/10" />
                  <div className="relative flex h-full flex-col justify-end">
                    <span className="text-3xl text-[#e1c17c]">{["⌁", "◈", "◌", "✦", "◒"][index]}</span>
                    <p className="mt-4 text-[9px] font-bold uppercase tracking-[.18em] text-white/45">{experience.category ?? "Experience"}</p>
                    <h3 className="luxury-serif mt-1 text-2xl">{experience.name}</h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/55">{experience.summary}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="luxury-section px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="luxury-kicker text-[#d8b875]">More places to consider</p>
              <h2 className="luxury-display mt-4 text-4xl sm:text-6xl">Keep looking.</h2>
            </div>
            <div className="max-w-md text-sm leading-7 text-white/50">{compactNumber(destinations.length)} destinations in the guide — with room for the list to keep growing.</div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {destinationCards.map((destination) => (
              <div key={destination.id} className="luxury-mini-card group overflow-hidden rounded-[1.35rem] border border-white/[.08] bg-white/[.025]">
                <a href={`/destinations/${destination.slug}`} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={destinationImages[destination.slug] ?? destinationImages.kandy} alt={destination.name} className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-95" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#06110d]/85 to-transparent" />
                    <span className="absolute left-4 top-4 luxury-chip">{destination.region}</span>
                    <button type="button" onClick={(event) => { event.preventDefault(); toggleSaved(destination.slug); }} className="luxury-save absolute right-4 top-4" aria-label={`Save ${destination.name}`}>{saved.includes(destination.slug) ? "Saved" : "Save"}</button>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="luxury-serif text-2xl">{destination.name}</h3>
                      <span className="luxury-circle-arrow">↗</span>
                    </div>
                    <p className="mt-2 text-xs leading-6 text-white/50">{destination.summary}</p>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="map" className="luxury-section border-y border-white/[.07] bg-[#081712] px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="luxury-kicker text-[#d8b875]">The island at a glance</p>
              <h2 className="luxury-display mt-4 text-4xl sm:text-6xl">See where you<br />could go.</h2>
              <p className="mt-5 text-sm leading-7 text-white/50">Start anywhere. Open the map, pick a place, save a stop or shape a route from the island's quieter edges.</p>
            </div>
            <a href="/map" className="luxury-pill luxury-pill-outline self-start lg:self-auto">Open full map <span>↗</span></a>
          </div>
          <div className="luxury-map-shell luxury-glass mt-10 overflow-hidden rounded-[1.8rem] border border-white/10 p-2 sm:p-3">
            <div className="overflow-hidden rounded-[1.45rem] border border-white/10">
              <InteractiveMap destinations={mapDestinations} />
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-section px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <p className="luxury-kicker text-[#d8b875]">From the journal</p>
              <h2 className="luxury-display mt-4 text-4xl sm:text-6xl">Stories for the<br />road between.</h2>
            </div>
            <a href="/stories" className="luxury-pill luxury-pill-outline self-start md:self-auto">Read all stories <span>↗</span></a>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-[1.25fr_1fr_1fr]">
            {visibleStories.map((story, index) => (
              <a key={story.id} href={`/stories/${story.slug}`} className={`group relative overflow-hidden rounded-[1.65rem] border border-white/10 bg-[#0c1f18] ${index === 0 ? "min-h-[430px]" : "min-h-[310px]"}`}>
                <img src={storyImages[index % storyImages.length]} alt={story.title} className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-1000 group-hover:scale-105 group-hover:opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06110d] via-[#06110d]/40 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 sm:inset-x-6 sm:bottom-6">
                  <p className="luxury-kicker text-[#d8b875]">{story.category}</p>
                  <h3 className="luxury-serif mt-3 text-3xl">{story.title}</h3>
                  <p className="mt-2 max-w-md text-xs leading-6 text-white/55">{story.excerpt}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="luxury-section px-6 pb-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c1f18]">
          <div className="relative px-6 py-16 text-center sm:px-10 sm:py-20 lg:px-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(216,184,117,.15),transparent_44%)]" />
            <div className="relative mx-auto max-w-3xl">
              <p className="luxury-kicker text-[#d8b875]">Your next chapter</p>
              <h2 className="luxury-display mt-4 text-4xl sm:text-6xl">Make the trip<br />feel like yours.</h2>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/50">Choose the feeling. Set the pace. Shape a route. Then keep the journey somewhere you can return to.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a href="/plan" className="luxury-pill luxury-pill-gold">Build my trip <span>↗</span></a>
                <a href="/my-trip" className="luxury-pill luxury-pill-outline">Open my trip <span>↗</span></a>
              </div>
            </div>
          </div>
        </div>
        <footer className="mx-auto mt-8 flex max-w-7xl flex-col justify-between gap-4 px-2 pb-4 text-[10px] font-semibold uppercase tracking-[.17em] text-white/28 sm:flex-row">
          <span>DiscoverLanka · Sri Lanka Travel Guide & Trip Planner</span>
          <span>Discover · Plan · Experience · Remember</span>
        </footer>
      </section>
    </main>
  );
}
