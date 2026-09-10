"use client";

import { useEffect, useMemo, useState } from "react";
import InteractiveMap from "@/components/InteractiveMapClient";
import SeasonalIntelligence from "@/components/SeasonalIntelligence";

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
  kandy: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1800&q=90",
  ella: "https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=1800&q=90",
  galle: "https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=1800&q=90",
  sigiriya: "https://images.unsplash.com/photo-1588598198321-9735fd5246b8?auto=format&fit=crop&w=1800&q=90",
  yala: "https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=1800&q=90",
  mirissa: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1800&q=90",
  "nuwara-eliya": "https://images.unsplash.com/photo-1590123221594-8c5d2c5f3f44?auto=format&fit=crop&w=1800&q=90",
  anuradhapura: "https://images.unsplash.com/photo-1588258524675-c7f1e3e8d5d8?auto=format&fit=crop&w=1800&q=90",
};

const experienceImages: Record<string, string> = {
  wildlife: "https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=1600&q=90",
  food: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1600&q=90",
  culture: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=90",
  slow: "https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=1600&q=90",
};

const storyImages = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1500&q=88",
  "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=1500&q=88",
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1500&q=88",
];

export default function Home() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/destinations").then((r) => r.json()),
      fetch("/api/experiences").then((r) => r.json()),
      fetch("/api/stories").then((r) => r.json()),
    ])
      .then(([d, e, s]) => {
        setDestinations(d.destinations ?? []);
        setExperiences(e.experiences ?? []);
        setStories(s.stories ?? []);
      })
      .catch(() => {});

    try {
      setSaved(JSON.parse(localStorage.getItem("discoverlanka-saved") ?? "[]"));
    } catch {
      setSaved([]);
    }
  }, []);

  function toggleSaved(slug: string) {
    setSaved((current) => {
      const next = current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug];
      localStorage.setItem("discoverlanka-saved", JSON.stringify(next));
      return next;
    });
  }

  const featured = destinations[0];
  const supporting = destinations.slice(1, 5);
  const mapDestinations = useMemo(
    () =>
      destinations.map((d) => ({
        ...d,
        latitude: d.latitude ?? 7.8731,
        longitude: d.longitude ?? 80.7718,
      })),
    [destinations]
  );

  return (
    <main className="luxury-home min-h-screen overflow-x-hidden bg-[#07120f] text-[#f4efe6]">
      <header className="fixed inset-x-0 top-0 z-50 px-3 py-3 sm:px-5 sm:py-5">
        <div className="luxury-nav mx-auto max-w-7xl">
          <a href="#top" className="brand-mark" aria-label="DiscoverLanka home">
            Discover<span>Lanka</span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium text-white/72 lg:flex">
            <a href="#discover" className="luxury-nav-link">Discover</a>
            <a href="/experiences" className="luxury-nav-link">Experiences</a>
            <a href="/stories" className="luxury-nav-link">Stories</a>
            <a href="/plan" className="luxury-nav-link">Plan</a>
            <a href="#map" className="luxury-nav-link">Map</a>
            <a href="/my-trip" className="luxury-nav-link">My Trip</a>
          </nav>

          <div className="flex items-center gap-2">
            <a href="/search" className="luxury-icon-button hidden sm:inline-flex" aria-label="Search">⌕</a>
            <a href="/plan" className="luxury-pill luxury-pill-gold hidden sm:inline-flex">Build My Trip <span>↗</span></a>
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="luxury-icon-button lg:hidden"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
            >
              {menuOpen ? "×" : "☰"}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="luxury-mobile-nav mx-auto mt-2 max-w-7xl lg:hidden">
            <a href="#discover" onClick={() => setMenuOpen(false)}>Discover</a>
            <a href="/search">Search</a>
            <a href="/experiences">Experiences</a>
            <a href="/stories">Stories</a>
            <a href="/plan">Plan</a>
            <a href="#map" onClick={() => setMenuOpen(false)}>Map</a>
            <a href="/my-trip">My Trip</a>
          </div>
        )}
      </header>

      <section id="top" className="luxury-hero relative isolate min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=2600&q=92')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,16,13,.80)_0%,rgba(5,20,16,.55)_36%,rgba(6,21,17,.16)_72%,rgba(3,10,8,.48)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(207,174,104,.18),transparent_32%)]" />

        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl items-center px-5 pb-10 pt-32 sm:px-8 md:pt-40">
          <div className="hero-glass-panel w-full">
            <div className="grid w-full gap-10 lg:grid-cols-[1.08fr_.92fr] lg:items-end lg:gap-12">
              <div className="max-w-4xl">
                <p className="luxury-kicker text-[#d8b875]">SRI LANKA · CURATED FOR YOU</p>
                <h1 className="luxury-display mt-6 max-w-4xl text-[3.8rem] leading-[.9] tracking-[-.055em] sm:text-7xl md:text-8xl lg:text-[7.1rem]">
                  Discover Sri Lanka.
                  <br />
                  <span className="text-[#e8cf9a]">Feel the journey.</span>
                </h1>
                <p className="mt-7 max-w-2xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                  Beautiful places, thoughtful experiences and a trip shaped around your time, taste and pace.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <a href="/plan" className="luxury-pill luxury-pill-gold">Build My Trip <span>↗</span></a>
                  <a href="#discover" className="luxury-pill luxury-pill-outline">Explore the island</a>
                </div>
                <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/18 pt-5 text-[10px] font-bold uppercase tracking-[.24em] text-white/58">
                  <span>Handpicked destinations</span>
                  <span>Local experiences</span>
                  <span>Season-aware planning</span>
                </div>
              </div>

              <div className="relative hidden min-h-[430px] lg:block">
                <div className="luxury-glass absolute right-0 top-4 w-[320px] overflow-hidden rounded-[2rem] border border-white/20 p-2 shadow-2xl shadow-black/30">
                  <img
                    src={destinationImages[featured?.slug ?? "sigiriya"] ?? destinationImages.sigiriya}
                    alt={featured?.name ?? "Sigiriya"}
                    className="h-[330px] w-full rounded-[1.55rem] object-cover"
                  />
                  <div className="p-5">
                    <p className="luxury-kicker text-[#d8b875]">FEATURED ESCAPE</p>
                    <div className="mt-2 flex items-end justify-between gap-4">
                      <div>
                        <h2 className="luxury-serif text-3xl">{featured?.name ?? "Sigiriya"}</h2>
                        <p className="mt-1 text-sm text-white/60">{featured?.region ?? "Central Province"}</p>
                      </div>
                      <span className="luxury-circle-arrow">↗</span>
                    </div>
                  </div>
                </div>

                <div className="luxury-glass absolute bottom-0 left-0 w-[220px] rounded-[1.6rem] border border-white/20 p-5">
                  <p className="luxury-kicker text-[#d8b875]">YOUR NEXT MEMORY</p>
                  <p className="mt-3 luxury-serif text-2xl leading-tight">A slower morning in the hills.</p>
                  <a href="/plan?interest=Slow%20travel" className="mt-5 inline-flex text-xs font-bold uppercase tracking-[.18em] text-white/74 hover:text-white">Plan around this feeling →</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#07120f] to-transparent" />
      </section>

      <section className="luxury-section border-y border-white/7 bg-[#07120f] px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <SeasonalIntelligence />
        </div>
      </section>

      <section id="discover" className="luxury-section bg-[#07120f] px-5 py-24 sm:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-10 md:flex-row md:items-end">
            <div>
              <p className="luxury-kicker text-[#d8b875]">THE ISLAND, REFINED</p>
              <h2 className="luxury-display mt-4 text-5xl md:text-7xl">Start with a feeling.</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-white/58 md:text-lg md:leading-8">
              Choose a place for the way you want the day to feel. Quiet hills, ancient stone, wild mornings or salt-air evenings.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-[1.45fr_.75fr]">
            {featured && (
              <a href={`/destinations/${featured.slug}`} className="luxury-feature-card group relative min-h-[620px] overflow-hidden rounded-[2.2rem]">
                <img src={destinationImages[featured.slug] ?? destinationImages.sigiriya} alt={featured.name} className="absolute inset-0 h-full w-full object-cover transition duration-[1400ms] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06100d] via-transparent to-transparent" />
                <div className="absolute left-6 right-6 top-6 flex items-center justify-between sm:left-8 sm:right-8">
                  <span className="luxury-chip">01 · FEATURED DESTINATION</span>
                  <button
                    onClick={(event) => { event.preventDefault(); toggleSaved(featured.slug); }}
                    className="luxury-save"
                  >
                    {saved.includes(featured.slug) ? "♥ Saved" : "♡ Save"}
                  </button>
                </div>
                <div className="absolute bottom-7 left-6 right-6 sm:bottom-9 sm:left-8 sm:right-8">
                  <p className="luxury-kicker text-[#d8b875]">{featured.region}</p>
                  <h3 className="mt-3 luxury-display text-5xl sm:text-6xl">{featured.name}</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">{featured.summary}</p>
                  <div className="mt-6 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[.18em] text-white/80">Explore destination <span className="luxury-circle-arrow">↗</span></div>
                </div>
              </a>
            )}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              {supporting.map((destination, index) => (
                <a key={destination.id} href={`/destinations/${destination.slug}`} className="luxury-mini-card group relative min-h-[145px] overflow-hidden rounded-[1.65rem]">
                  <img src={destinationImages[destination.slug] ?? destinationImages.kandy} alt={destination.name} className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#07120f]/92 via-[#07120f]/55 to-[#07120f]/5" />
                  <div className="relative flex min-h-[145px] items-end justify-between p-5">
                    <div>
                      <p className="luxury-kicker text-[#d8b875]">0{index + 2} · {destination.region}</p>
                      <h3 className="mt-2 luxury-serif text-2xl">{destination.name}</h3>
                    </div>
                    <span className="text-white/65 transition-transform group-hover:translate-x-1">↗</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-section border-y border-white/7 bg-[#0d211a] px-5 py-24 sm:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="luxury-kicker text-[#d8b875]">TRAVEL FOR THE WAY IT FEELS</p>
            <h2 className="luxury-display mt-4 text-5xl md:text-7xl">Less checklist.<br />More connection.</h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/58 md:text-lg md:leading-8">Our experiences are built around how you want Sri Lanka to feel — not simply what you can fit into a day.</p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {experiences.slice(0, 4).map((experience, index) => (
              <a key={experience.id} href={`/plan?interest=${encodeURIComponent(experience.category ?? "")}`} className="luxury-experience-card group overflow-hidden rounded-[2rem] border border-white/8 bg-white/[.03]">
                <div className="relative h-64 overflow-hidden">
                  <img src={experienceImages[experience.slug] ?? experienceImages.wildlife} alt={experience.name} className="h-full w-full object-cover transition duration-[1100ms] group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d211a] via-transparent to-transparent" />
                  <div className="absolute left-5 top-5 luxury-chip">0{index + 1}</div>
                </div>
                <div className="p-7">
                  <p className="luxury-kicker text-[#d8b875]">{experience.category ?? "Experience"}</p>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <h3 className="luxury-serif text-3xl">{experience.name}</h3>
                    <span className="luxury-circle-arrow shrink-0">↗</span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/56">{experience.summary}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="map" className="luxury-section bg-[#07120f] px-5 py-24 sm:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="luxury-kicker text-[#d8b875]">THE ISLAND AT A GLANCE</p>
              <h2 className="luxury-display mt-4 text-5xl md:text-7xl">See where you could go.</h2>
            </div>
            <a href="https://www.openstreetmap.org/?mlat=7.8731&mlon=80.7718#map=8/7.8731/80.7718" target="_blank" rel="noreferrer" className="text-xs font-bold uppercase tracking-[.18em] text-white/60 hover:text-white">Open full map ↗</a>
          </div>

          <div className="luxury-map-shell mt-12 overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#10211b] p-2">
            <div className="overflow-hidden rounded-[1.8rem]">
              <InteractiveMap destinations={mapDestinations} />
            </div>
            <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4">
              {destinations.slice(0, 8).map((destination) => (
                <a key={destination.id} href={`/destinations/${destination.slug}`} className="luxury-map-link">{destination.name}<span>↗</span></a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-section bg-[#081811] px-5 py-24 sm:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="luxury-kicker text-[#d8b875]">FROM THE JOURNAL</p>
              <h2 className="luxury-display mt-4 text-5xl md:text-7xl">Go beyond the guidebook.</h2>
            </div>
            <a href="/stories" className="text-xs font-bold uppercase tracking-[.18em] text-white/60 hover:text-white">See all stories →</a>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {stories.slice(0, 3).map((story, index) => (
              <a key={story.id} href={`/stories/${story.slug}`} className="group overflow-hidden rounded-[2rem] border border-white/8 bg-white/[.03]">
                <div className="relative h-72 overflow-hidden">
                  <img src={storyImages[index % storyImages.length]} alt="" className="h-full w-full object-cover transition duration-[1100ms] group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#081811] via-transparent to-transparent" />
                  <p className="absolute bottom-5 left-5 luxury-kicker text-[#d8b875]">{story.category || "Sri Lanka"}</p>
                </div>
                <div className="p-7">
                  <h3 className="luxury-serif text-3xl leading-tight">{story.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/55">{story.excerpt}</p>
                  <span className="mt-6 inline-flex text-xs font-bold uppercase tracking-[.18em] text-white/68 group-hover:text-white">Read story →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="luxury-section relative overflow-hidden border-t border-white/8 bg-[#d7c49a] px-5 py-28 text-[#102018] sm:px-8 md:py-36">
        <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_20%_20%,#fff,transparent_28%),radial-gradient(circle_at_80%_70%,#fff,transparent_28%)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="luxury-kicker !text-[#715a2f]">YOUR NEXT CHAPTER</p>
          <h2 className="luxury-display mt-4 text-5xl md:text-7xl">Make the trip feel like yours.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#4f564e] md:text-lg md:leading-8">A beautiful route is only the beginning. Build a Sri Lankan journey around your own rhythm.</p>
          <a href="/plan" className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#102018] px-7 py-4 text-sm font-bold text-[#f4efe6] shadow-xl shadow-black/10 transition hover:-translate-y-0.5">Build My Trip <span>↗</span></a>
        </div>
      </section>

      <footer className="bg-[#050d0a] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-10 border-b border-white/8 pb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="brand-mark text-2xl">Discover<span>Lanka</span></div>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/45">Discover Sri Lanka. Plan Your Journey.</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold uppercase tracking-[.18em] text-white/45">
              <a href="/search" className="hover:text-white">Search</a>
              <a href="/experiences" className="hover:text-white">Experiences</a>
              <a href="/stories" className="hover:text-white">Stories</a>
              <a href="/plan" className="hover:text-white">Plan</a>
              <a href="/my-trip" className="hover:text-white">My Trip</a>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-7 text-[10px] uppercase tracking-[.2em] text-white/30 sm:flex-row sm:justify-between">
            <span>DiscoverLanka · Sri Lanka</span>
            <span>{saved.length} saved {saved.length === 1 ? "place" : "places"}</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
