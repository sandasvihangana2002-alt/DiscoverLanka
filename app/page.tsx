"use client";

import { useEffect, useMemo, useState } from "react";
import { Compass, Landmark, Sparkles, Trees, UtensilsCrossed } from "lucide-react";
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
  "adams-peak": "https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=1800&q=90",
  bentota: "https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=1800&q=90",
  dambulla: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1800&q=90",
  hikkaduwa: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1800&q=90",
  "horton-plains": "https://images.unsplash.com/photo-1590123221594-8c5d2c5f3f44?auto=format&fit=crop&w=1800&q=90",
  kalpitiya: "https://images.unsplash.com/photo-1603398749944-1e39e3adf9e2?auto=format&fit=crop&w=1800&q=90",
  kitulgala: "https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=1800&q=90",
  knuckles: "https://images.unsplash.com/photo-1590123221594-8c5d2c5f3f44?auto=format&fit=crop&w=1800&q=90",
  polonnaruwa: "https://images.unsplash.com/photo-1588258524675-c7f1e3e8d5d8?auto=format&fit=crop&w=1800&q=90",
  sinharaja: "https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=1800&q=90",
  nilaveli: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=90",
  pasikuda: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1800&q=90",
  batticaloa: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1800&q=90",
  mannar: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=90",
  wilpattu: "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1800&q=90",
  mihintale: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=1800&q=90",
  yapahuwa: "https://images.unsplash.com/photo-1588598198321-9735fd5246b8?auto=format&fit=crop&w=1800&q=90",
  riverston: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=90",
  haputale: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1800&q=90",
  "delft-island": "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1800&q=90",
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

const experienceIcons = {
  Adventure: Compass,
  Culture: Landmark,
  Nature: Trees,
  Wellness: Sparkles,
  Food: UtensilsCrossed,
};

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

  const mapDestinations = useMemo(() => destinations.filter((d) => typeof d.latitude === "number" && typeof d.longitude === "number" && Number.isFinite(d.latitude) && Number.isFinite(d.longitude)), [destinations]);

  const featured = destinations.find((d) => d.slug === "kandy") ?? destinations[0];
  const featuredJourney = destinations.find((d) => d.slug === "sigiriya") ?? destinations[1];
  const journeyCards = [
    featuredJourney,
    destinations.find((d) => d.slug === "ella"),
    destinations.find((d) => d.slug === "yala"),
    destinations.find((d) => d.slug === "mirissa"),
  ].filter(Boolean) as Destination[];
  const destinationCards = destinations.filter((d) => d.slug !== featured?.slug).slice(0, 24);

  const categories = ["Adventure", "Culture", "Nature", "Wellness", "Food"];
  const experienceCards = categories.map((name) => experiences.find((e) => e.category?.toLowerCase() === name.toLowerCase()) ?? experiences.find((e) => e.name.toLowerCase().includes(name.toLowerCase()))).filter(Boolean) as Experience[];
  const visibleStories = stories.slice(0, 3);

  return (
    <main className="home-rebuild min-h-screen bg-[#f4efe5] text-[#17251f]">
      <header className="home-nav fixed inset-x-0 top-0 z-50 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-[#d9b972]/25 bg-[#07140f]/52 px-5 py-3.5 text-white shadow-[0_18px_60px_rgba(0,0,0,.24)] backdrop-blur-2xl sm:px-7">
          <a href="#top" className="home-brand group flex items-center gap-2.5" aria-label="DiscoverLanka home">
            <span className="home-brand-mark" aria-hidden="true">◈</span>
            <span className="font-serif text-xl tracking-[-.03em] sm:text-2xl">Discover<span className="text-[#d9b972]">Lanka</span></span>
          </a>
          <nav className="hidden items-center gap-8 text-[10px] font-black uppercase tracking-[.17em] text-white/70 lg:flex" aria-label="Primary navigation">
            <a className="home-nav-link" href="#discover">Discover</a><a className="home-nav-link" href="/destinations">Destinations</a><a className="home-nav-link" href="/experiences">Experiences</a><a className="home-nav-link" href="/stories">Stories</a><a className="home-nav-link" href="/plan">Plan</a><a className="home-nav-link" href="#map">Map</a><a className="home-nav-link" href="/my-trip">My Trip</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="/search" className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm sm:inline-flex" aria-label="Search">⌕</a>
            <a href="/plan" className="home-trip-cta hidden rounded-full bg-[#e3bd78] px-5 py-3 text-[11px] font-black uppercase tracking-[.12em] text-[#102018] sm:inline-flex">Build My Trip ↗</a>
            <button onClick={() => setMenuOpen((v) => !v)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-lg lg:hidden" aria-label="Toggle navigation">{menuOpen ? "×" : "☰"}</button>
          </div>
        </div>
        <div className="home-nav-ornament" aria-hidden="true"><span>◆</span><i></i><span>◆</span></div>
        {menuOpen && <div className="home-mobile-menu mx-auto mt-2 grid max-w-7xl gap-1 rounded-3xl border border-white/10 bg-[#10251f]/95 p-3 text-white backdrop-blur-xl lg:hidden"><a className="rounded-2xl px-4 py-3" href="#discover">Discover</a><a className="rounded-2xl px-4 py-3" href="/destinations">Destinations</a><a className="rounded-2xl px-4 py-3" href="/experiences">Experiences</a><a className="rounded-2xl px-4 py-3" href="/stories">Stories</a><a className="rounded-2xl px-4 py-3" href="/plan">Plan</a><a className="rounded-2xl px-4 py-3" href="#map">Map</a><a className="rounded-2xl px-4 py-3" href="/my-trip">My Trip</a></div>}
      </header>

      <section id="top" className="home-hero relative min-h-[100svh] overflow-hidden bg-[#0a1712]">
        <img src="https://media.cntraveller.com/photos/611beb6d628f4910ed1020a7/16:9/w_1920%2Cc_limit/sri-lanka-sh-conde-nast-traveller-27jul20-1129567869.jpg" alt="Sri Dalada Maligawa in Kandy, Sri Lanka" className="home-hero-image absolute inset-0 h-full w-full object-cover object-[center_42%] transition-transform duration-[1800ms] scale-[1.015]" />
        <div className="home-hero-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl items-end px-6 pb-20 pt-32 sm:px-8 sm:pb-24 lg:px-10 lg:pb-32">
          <div className="max-w-2xl text-white">
            <div className="home-hero-rule mb-5 flex items-center gap-3"><span></span><p>Island of living heritage</p></div>
            <h1 className="font-serif text-[4.2rem] leading-[.86] tracking-[-.05em] sm:text-7xl md:text-8xl lg:text-[6.8rem]">Discover Sri Lanka.<br/><span className="text-[#efcf87]">Feel the heritage.</span></h1>
            <p className="mt-7 max-w-lg text-sm leading-7 text-white/80 sm:text-base sm:leading-8">Step into an island where ancient traditions, living culture and unforgettable landscapes meet.</p>
            <div className="mt-8 flex flex-wrap gap-3"><a href="/plan" className="home-hero-primary rounded-full bg-[#e3bd78] px-6 py-3.5 text-[11px] font-black uppercase tracking-[.14em] text-[#102018] shadow-[0_14px_40px_rgba(0,0,0,.18)]">Build My Trip ↗</a><a href="#discover" className="home-hero-secondary rounded-full border border-white/28 bg-black/10 px-6 py-3.5 text-[11px] font-black uppercase tracking-[.14em] text-white backdrop-blur-md">Explore the island</a></div>
            <div className="mt-10 flex max-w-xl flex-wrap gap-7 border-t border-white/20 pt-5 text-[9px] font-bold uppercase tracking-[.2em] text-white/60"><span>Handpicked destinations</span><span>Local experiences</span><span>Season-aware planning</span></div>
          </div>
        </div>
        <a href="#discover" className="home-hero-scroll absolute bottom-7 right-6 hidden items-center gap-3 text-white/60 lg:flex" aria-label="Scroll to discover"><span>Explore</span><i></i><b>↓</b></a>
      </section>

      <section id="discover" className="relative overflow-hidden bg-[#0a1712] px-6 py-24 text-[#f4efe6] sm:px-8 lg:px-10 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(216,184,117,.10),transparent_26%),radial-gradient(circle_at_88%_70%,rgba(62,112,88,.13),transparent_32%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-10 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 text-[#d9b972]"><span className="h-px w-10 bg-[#d9b972]/70" /><p className="text-[10px] font-black uppercase tracking-[.28em]">The Discover Edit</p></div>
              <h2 className="mt-5 font-serif text-5xl leading-[.9] tracking-[-.04em] sm:text-6xl lg:text-7xl">Journeys with<br/><span className="text-[#d9b972]">a sense of place.</span></h2>
            </div>
            <div className="max-w-md lg:pb-1"><p className="text-sm leading-7 text-white/60">A considered collection of Sri Lanka’s landscapes, heritage and quiet escapes — chosen for travelers who want to experience the island, not simply pass through it.</p><a href="/destinations" className="mt-6 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[.2em] text-[#e3c681]">View the full collection <span>↗</span></a></div>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {journeyCards.map((item, index) => <a key={item.id} href={`/destinations/${item.slug}`} className="group relative min-h-[440px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#102019] shadow-[0_24px_80px_rgba(0,0,0,.24)]">
              <img src={destinationImages[item.slug] ?? destinationImages.sigiriya} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover transition duration-[1400ms] group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06100c] via-[#06100c]/30 to-[#06100c]/5" />
              
              <div className="absolute inset-x-5 bottom-5"><div className="h-px w-10 bg-[#d9b972] transition-all duration-500 group-hover:w-16" /><h3 className="mt-2 font-serif text-3xl tracking-[-.02em] text-white sm:text-4xl">{item.name}</h3><p className="mt-2 max-w-[18rem] text-xs leading-5 text-white/60">{item.summary}</p><div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-[9px] font-black uppercase tracking-[.18em] text-white/60"><span>Discover place</span><span className="text-[#e3c681] transition-transform group-hover:translate-x-1">↗</span></div></div>
            </a>)}
          </div>
        </div>
      </section>

      <section id="experiences" className="home-kandyan-experiences relative overflow-hidden bg-[#0a1712] px-6 py-20 text-white sm:px-8 lg:px-10 lg:py-24"><img src="https://cdn.bunniktours.com.au/public/posts/images/Asia/Hero%20image%20-%20Sri%20Lanka%20Scenery%20-%20Annelieke%20Huijgens-feature.png" alt="Traditional Kandyan dance performance in Sri Lanka" className="absolute inset-0 h-full w-full object-cover object-center opacity-55"/><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,13,10,.96)_0%,rgba(5,13,10,.80)_38%,rgba(5,13,10,.48)_100%)]"/><div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_78%_20%,rgba(216,184,117,.18),transparent_24%),radial-gradient(circle_at_30%_90%,rgba(107,33,33,.16),transparent_30%)]"/><div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[300px_1fr] lg:items-center"><div><div className="home-kandyan-kicker"><span>◆</span><p>Explore by experience</p><span>◆</span></div><h2 className="mt-4 font-serif text-4xl leading-[.98] tracking-[-.035em] sm:text-5xl">Find your<br/><span>kind of Sri Lanka.</span></h2><p className="mt-5 text-sm leading-7 text-white/65">From living heritage to wild landscapes and slow island days, choose the experience that feels like you.</p><a href="/experiences" className="home-kandyan-link mt-6 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[.18em]">Explore experiences <span>↗</span></a></div><div className="home-kandyan-grid grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{categories.map((name, i) => { const Icon = experienceIcons[name as keyof typeof experienceIcons] ?? Sparkles; return <a key={name} href={`/experiences?category=${encodeURIComponent(name)}`} className="home-kandyan-card group"><div className="home-kandyan-card-frame"><span className="home-kandyan-card-corner home-kandyan-card-corner-tl"/><span className="home-kandyan-card-corner home-kandyan-card-corner-br"/><span className="home-kandyan-number">0{i + 1}</span><div className="home-kandyan-icon"><Icon size={27} strokeWidth={1.7} aria-hidden="true"/></div><div className="home-kandyan-name">{name}</div><div className="home-kandyan-line"/><span className="home-kandyan-arrow">↗</span></div></a> })}</div></div></section>

      <section className="home-travel-stories relative overflow-hidden bg-[#142b22] px-6 py-20 text-white sm:px-8 lg:px-10 lg:py-24"><div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,185,114,.15),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(87,142,111,.14),transparent_30%)]"/><div className="relative mx-auto max-w-7xl"><div className="grid gap-10 lg:grid-cols-[1fr_1.35fr]"><div><p className="home-travel-kicker text-[10px] font-black uppercase tracking-[.25em]">Travel stories</p><h2 className="home-travel-heading mt-3 font-serif text-5xl leading-[.92]"><span>Real people.</span><br/><span className="home-travel-heading-accent">True stories.</span></h2><p className="home-travel-copy mt-5 max-w-sm text-sm leading-7">Discover how Sri Lanka changes lives, one journey at a time.</p><a href="/stories" className="home-travel-link mt-6 inline-flex text-[10px] font-black uppercase tracking-[.18em]">Explore stories →</a></div><div className="grid gap-4 sm:grid-cols-3">{visibleStories.map((story, index) => <article key={story.id} className="rounded-[1.5rem] bg-[#f4efe5] p-5 text-[#17251f] shadow-2xl"><div className="flex items-center gap-3"><div className="h-9 w-9 overflow-hidden rounded-full bg-[#d9b972]"><img src={storyImages[index]} alt="" className="h-full w-full object-cover"/></div><div><p className="text-[8px] font-black uppercase tracking-[.18em] text-[#88703b]">{story.category}</p><p className="text-[10px] text-[#7a827a]">DiscoverLanka traveler</p></div></div><p className="mt-6 font-serif text-xl leading-tight">“{story.excerpt.replace(/[“”]/g, "").slice(0, 125)}”</p><div className="mt-5 text-[#bb8b2d]">★★★★★</div></article>)}</div></div></div></section>

      <section className="relative overflow-hidden bg-[#0b2018] px-6 py-10 text-white sm:px-8 lg:px-10"><img src="https://dh63zq931d1yt.cloudfront.net/sites/3/2025/04/IMG_4772_DxO-1-2048x1366.jpg" alt="Sri Lankan mountain horizon" className="absolute inset-0 h-full w-full object-cover opacity-40"/><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,20,15,.72)_0%,rgba(7,20,15,.48)_45%,rgba(7,20,15,.62)_100%)]"/><div className="relative mx-auto flex max-w-7xl flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.24em] text-[#d9b972]">Your next journey</p><h2 className="mt-2 font-serif text-4xl">Ready to explore Sri Lanka?</h2><p className="mt-2 text-sm text-white/65">Build a trip that feels uniquely yours.</p></div><a href="/plan" className="rounded-full bg-[#e3bd78] px-7 py-4 text-[11px] font-black uppercase tracking-[.15em] text-[#102018]">Build My Trip ↗</a></div></section>

      <section id="map" className="relative overflow-hidden bg-[#f4efe5] px-6 py-24 sm:px-8 lg:px-10 lg:py-32"><div className="absolute inset-x-0 top-0 h-px bg-[#17251f]/10"/><div className="relative mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div className="max-w-2xl"><div className="flex items-center gap-3 text-[#a27a31]"><span className="h-px w-10 bg-[#a27a31]/65"/><p className="text-[10px] font-black uppercase tracking-[.28em]">The island at a glance</p></div><h2 className="mt-5 font-serif text-5xl leading-[.92] tracking-[-.04em] text-[#17251f] sm:text-6xl lg:text-7xl">See where your<br/><span className="text-[#9b762f]">journey could take you.</span></h2><p className="mt-5 max-w-xl text-sm leading-7 text-[#657068]">Explore Sri Lanka by place, region and experience. Select a pin, find a destination, or start building your route directly from the map.</p></div><a href="https://www.openstreetmap.org/?mlat=7.8731&mlon=80.7718#map=8/7.8731/80.7718" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[.18em] text-[#7b5d24]">Open full map <span>↗</span></a></div><div className="mt-12 overflow-hidden rounded-[2rem] border border-[#17251f]/10 bg-[#11261e] p-1.5 shadow-[0_28px_90px_rgba(23,37,31,.12)]"><div className="overflow-hidden rounded-[1.7rem]"><InteractiveMap destinations={mapDestinations} /></div></div></div></section>

      <footer className="bg-[#07140f] px-6 py-14 text-white sm:px-8 lg:px-10"><div className="mx-auto max-w-7xl"><div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]"><div><div className="font-serif text-3xl">Discover<span className="text-[#d9b972]">Lanka</span></div><p className="mt-3 max-w-sm text-sm leading-7 text-white/45">Discover Sri Lanka. Plan your journey.</p></div><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-[#d9b972]">Quick links</p><div className="mt-4 grid gap-2 text-sm text-white/60"><a href="#discover">Discover</a><a href="/experiences">Experiences</a><a href="/stories">Stories</a><a href="/plan">Plan</a><a href="/my-trip">My Trip</a></div></div><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-[#d9b972]">Support</p><div className="mt-4 grid gap-2 text-sm text-white/60"><a href="/search">Search</a><a href="/account">Account</a><a href="/">Privacy</a></div></div><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-[#d9b972]">Explore</p><div className="mt-4 grid gap-2 text-sm text-white/60"><a href="/destinations">Destinations</a><a href="#map">Map</a><a href="/stories">Journal</a></div></div></div><div className="flex flex-col gap-3 pt-7 text-[9px] uppercase tracking-[.18em] text-white/25 sm:flex-row sm:justify-between"><span>DiscoverLanka · Sri Lanka</span><span>Curated for the way you travel</span></div></div></footer>
    </main>
  );
}