"use client";

import { useEffect, useState } from "react";
import InteractiveMap from "@/components/InteractiveMapClient";
import SeasonalIntelligence from "@/components/SeasonalIntelligence";

type Destination = { id:string; name:string; region:string; summary:string; slug:string };
type Experience = { id:string; slug:string; name:string; category:string|null; summary:string|null };
type Story = { id:string; slug:string; title:string; excerpt:string; category:string };

const destinationImages:Record<string,string>={
  kandy:"https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=85",
  ella:"https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=1600&q=85",
  galle:"https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=1600&q=85",
  sigiriya:"https://images.unsplash.com/photo-1588598198321-9735fd5246b8?auto=format&fit=crop&w=1600&q=85",
  yala:"https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=1600&q=85",
  mirissa:"https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1600&q=85",
  "nuwara-eliya":"https://images.unsplash.com/photo-1590123221594-8c5d2c5f3f44?auto=format&fit=crop&w=1600&q=85",
  anuradhapura:"https://images.unsplash.com/photo-1588258524675-c7f1e3e8d5d8?auto=format&fit=crop&w=1600&q=85",
};
const experienceImages:Record<string,string>={
  wildlife:"https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=1400&q=85",
  food:"https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1400&q=85",
  culture:"https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=85",
  slow:"https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=1400&q=85",
};

export default function Home(){
  const [destinations,setDestinations]=useState<Destination[]>([]);
  const [experiences,setExperiences]=useState<Experience[]>([]);
  const [stories,setStories]=useState<Story[]>([]);
  const [saved,setSaved]=useState<string[]>([]);

  useEffect(()=>{
    Promise.all([
      fetch("/api/destinations").then(r=>r.json()),
      fetch("/api/experiences").then(r=>r.json()),
      fetch("/api/stories").then(r=>r.json()),
    ]).then(([d,e,s])=>{
      setDestinations(d.destinations??[]);
      setExperiences(e.experiences??[]);
      setStories(s.stories??[]);
    }).catch(()=>{});
    try{setSaved(JSON.parse(localStorage.getItem("discoverlanka-saved")??"[]"))}catch{}
  },[]);

  function toggleSaved(slug:string){
    setSaved(current=>{
      const next=current.includes(slug)?current.filter(x=>x!==slug):[...current,slug];
      localStorage.setItem("discoverlanka-saved",JSON.stringify(next));
      return next;
    });
  }

  const featured=destinations[0];
  const supporting=destinations.slice(1,5);

  return <main className="premium-page bg-[#f6f2e9] text-[#10251f]">
    <header className="fixed inset-x-0 top-0 z-50 px-3 py-3 sm:px-5 sm:py-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/20 bg-[#0c261f]/60 px-4 py-3 text-white shadow-lg backdrop-blur-xl sm:px-5">
        <a href="#top" className="text-lg font-bold tracking-tight sm:text-xl">Discover<span className="text-[#e7c98b]">Lanka</span></a>
        <nav className="hidden items-center gap-7 text-sm font-semibold lg:flex"><a href="#discover">Discover</a><a href="/search">Search</a><a href="/experiences">Experiences</a><a href="/plan">Plan</a><a href="#stories">Stories</a><a href="#map">Map</a><a href="/my-trip">My Trip</a></nav>
        <a href="/plan" className="premium-button premium-button-gold text-xs sm:text-sm">Build My Trip</a>
      </div>
      <nav className="mx-auto mt-2 flex max-w-7xl gap-1 overflow-x-auto rounded-full border border-white/10 bg-[#0c261f]/45 px-2 py-2 text-xs font-semibold text-white backdrop-blur-xl lg:hidden">
        <a href="#discover" className="shrink-0 rounded-full bg-white/10 px-3 py-2">Discover</a><a href="/search" className="shrink-0 rounded-full px-3 py-2">Search</a><a href="/experiences" className="shrink-0 rounded-full px-3 py-2">Experiences</a><a href="/plan" className="shrink-0 rounded-full px-3 py-2">Plan</a><a href="#stories" className="shrink-0 rounded-full px-3 py-2">Stories</a><a href="#map" className="shrink-0 rounded-full px-3 py-2">Map</a><a href="/my-trip" className="shrink-0 rounded-full px-3 py-2">My Trip</a>
      </nav>
    </header>

    <section id="top" className="relative min-h-[92vh] overflow-hidden bg-[#0c261f] text-white">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=2400&q=90')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(12,38,31,.83),rgba(12,38,31,.34)_55%,rgba(12,38,31,.68))]" />
      <div className="absolute inset-0 hero-grid opacity-40" />
      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl items-end px-5 pb-16 pt-36 sm:px-8 sm:pb-20 md:pb-24">
        <div className="max-w-4xl">
          <p className="premium-kicker !text-[#e7c98b]">Sri Lanka · Your way</p>
          <h1 className="premium-display mt-7 max-w-4xl text-6xl text-white sm:text-7xl md:text-8xl lg:text-[7.2rem]">Discover Sri Lanka.<br/><span className="text-[#e7c98b]">Plan Your Journey.</span></h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-white/72 sm:text-lg sm:leading-8">A slower, more considered way to discover the island — shaped around your interests, time, budget and the moments you want to remember.</p>
          <div className="mt-9 flex flex-wrap gap-3"><a href="/plan" className="premium-button premium-button-gold">Build My Trip <span className="ml-2">→</span></a><a href="#discover" className="premium-button premium-button-ghost">Explore the island</a></div>
          <div className="mt-14 flex flex-wrap gap-8 border-t border-white/15 pt-6 text-xs uppercase tracking-[.18em] text-white/55"><span>Curated places</span><span>Local experiences</span><span>Stories & seasonality</span></div>
        </div>
      </div>
    </section>

    <SeasonalIntelligence />

    <section id="discover" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-32">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end"><div><p className="premium-kicker">The island, carefully chosen</p><h2 className="premium-display mt-4 text-5xl md:text-7xl">Start with a place.</h2></div><p className="premium-muted max-w-xl text-base leading-8 md:text-lg">From ancient cities and cool hill country to wild parks and southern shores, begin with one place and let the journey unfold.</p></div>
      <div className="mt-14 grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
        {featured&&<article className="group relative min-h-[580px] overflow-hidden rounded-[2rem] bg-[#16382f] text-white"><a href={`/destinations/${featured.slug}`} className="absolute inset-0"><img src={destinationImages[featured.slug]??destinationImages.kandy} alt={featured.name} className="h-full w-full object-cover transition duration-1000 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#0c261f]/95 via-[#0c261f]/10 to-transparent"/></a><button onClick={()=>toggleSaved(featured.slug)} className="absolute right-5 top-5 z-10 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-[#16382f]">{saved.includes(featured.slug)?"♥ Saved":"♡ Save"}</button><div className="absolute bottom-0 left-0 right-0 p-7 sm:p-9"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#e7c98b]">{featured.region}</p><h3 className="mt-3 text-5xl font-semibold md:text-6xl">{featured.name}</h3><p className="mt-3 max-w-xl text-white/68">{featured.summary}</p><span className="mt-5 inline-flex text-sm font-bold text-[#e7c98b]">Explore destination →</span></div></article>}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">{supporting.map(d=><article key={d.id} className="group relative min-h-[135px] overflow-hidden rounded-[1.6rem] bg-[#16382f] text-white"><a href={`/destinations/${d.slug}`} className="absolute inset-0"><img src={destinationImages[d.slug]??destinationImages.kandy} alt={d.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-r from-[#0c261f]/90 via-[#0c261f]/45 to-[#0c261f]/10"/></a><button onClick={()=>toggleSaved(d.slug)} className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-3 py-2 text-xs font-bold text-[#16382f]">{saved.includes(d.slug)?"♥":"♡"}</button><div className="relative flex min-h-[135px] items-end p-5"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#e7c98b]">{d.region}</p><h3 className="mt-1 text-2xl font-semibold">{d.name}</h3></div></div></article>)}</div>
      </div>
    </section>

    <section className="border-y border-black/5 bg-[#16382f] px-5 py-24 text-white sm:px-8 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="premium-kicker !text-[#e7c98b]">Travel for the feeling</p><h2 className="premium-display mt-4 text-5xl md:text-7xl">More than places.</h2></div><div><p className="max-w-2xl text-lg leading-8 text-white/68">Choose the mood first. Then let DiscoverLanka help turn that feeling into a route.</p><div className="mt-9 grid gap-4 sm:grid-cols-2">{experiences.slice(0,4).map(x=><a key={x.id} href={`/plan?interest=${encodeURIComponent(x.category??"")}`} className="group premium-card overflow-hidden border-white/10 bg-white/5 text-white"><div className="h-44 overflow-hidden"><img src={experienceImages[x.slug]??experienceImages.wildlife} alt={x.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/></div><div className="p-5"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#e7c98b]">{x.category??"Experience"}</p><h3 className="mt-2 text-2xl font-semibold">{x.name}</h3><p className="mt-2 text-sm leading-6 text-white/58">{x.summary}</p></div></a>)}</div></div></div>
    </section>

    <section id="map" className="px-5 py-24 sm:px-8 md:py-32"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="premium-kicker">Explore the island</p><h2 className="premium-display mt-4 text-5xl md:text-7xl">See where the journey leads.</h2></div><a href="https://www.openstreetmap.org/?mlat=7.8731&mlon=80.7718#map=8/7.8731/80.7718" target="_blank" rel="noreferrer" className="text-sm font-bold text-[#16382f]">Open full map ↗</a></div><div className="premium-card mt-12 overflow-hidden p-2"><div className="overflow-hidden rounded-[1.45rem]"><InteractiveMap destinations={destinations}/></div><div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4">{destinations.slice(0,8).map(d=><a key={d.id} href={`/destinations/${d.slug}`} className="rounded-xl bg-[#eeeadf] px-4 py-3 text-sm font-semibold">{d.name}<span className="ml-2 text-[#8d7447]">→</span></a>)}</div></div></div></section>

    <section className="bg-[#e8e0d0] px-5 py-24 sm:px-8 md:py-32"><div className="mx-auto max-w-6xl text-center"><p className="premium-kicker">Your journey starts here</p><h2 className="premium-display mt-4 text-5xl md:text-7xl">A trip should feel like yours.</h2><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#66756f]">Tell us how you want to travel. We’ll shape a Sri Lankan route around your time, interests and pace.</p><a href="/plan" className="premium-button premium-button-dark mt-9">Build My Trip →</a></div></section>

    <section id="stories" className="px-5 py-24 sm:px-8 md:py-32"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="premium-kicker">Stories from the island</p><h2 className="premium-display mt-4 text-5xl md:text-7xl">Go beyond the guidebook.</h2></div><a href="/stories" className="text-sm font-bold text-[#16382f]">See all stories →</a></div><div className="mt-14 grid gap-5 md:grid-cols-3">{stories.slice(0,3).map((s,i)=><a key={s.id} href={`/stories/${s.slug}`} className={`group premium-card overflow-hidden ${i===0?"md:row-span-2 md:min-h-[520px]":""}`}><div className="h-52 overflow-hidden md:h-60"><div className="h-full w-full bg-[#16382f] transition duration-700 group-hover:scale-105"/></div><div className="p-7"><p className="premium-kicker">{s.category||"Sri Lanka"}</p><h3 className="mt-3 text-2xl font-semibold leading-tight">{s.title}</h3><p className="premium-muted mt-4 leading-7">{s.excerpt}</p><span className="mt-6 inline-flex text-sm font-bold text-[#16382f]">Read story →</span></div></a>)}{stories.length===0&&<div className="premium-card p-10 md:col-span-3"><p className="premium-muted">New Sri Lanka stories are coming soon.</p></div>}</div></div></section>

    <footer className="bg-[#0c261f] px-5 py-16 text-white sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-end md:justify-between"><div><div className="text-2xl font-bold">Discover<span className="text-[#e7c98b]">Lanka</span></div><p className="mt-3 max-w-sm text-sm leading-6 text-white/45">Discover Sri Lanka. Plan Your Journey.</p></div><div className="text-sm text-white/45">{saved.length} saved {saved.length===1?"place":"places"} · <a href="/my-trip" className="text-[#e7c98b]">Open My Trip →</a></div></div></footer>
  </main>;
}
