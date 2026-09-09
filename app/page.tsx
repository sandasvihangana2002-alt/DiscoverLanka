"use client";

import { useEffect, useState } from "react";

type Destination = {
  id: string;
  name: string;
  region: string;
  summary: string;
  description: string;
  latitude: number;
  longitude: number;
  best_time: string;
  slug: string;
};

const destinationImages: Record<string, string> = {
  kandy: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
  ella: "https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=1200&q=80",
  galle: "https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=1200&q=80",
  sigiriya: "https://images.unsplash.com/photo-1588598198321-9735fd5246b8?auto=format&fit=crop&w=1200&q=80",
  yala: "https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=1200&q=80",
  mirissa: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1200&q=80",
  "nuwara-eliya": "https://images.unsplash.com/photo-1590123221594-8c5d2c5f3f44?auto=format&fit=crop&w=1200&q=80",
  anuradhapura: "https://images.unsplash.com/photo-1588258524675-c7f1e3e8d5d8?auto=format&fit=crop&w=1200&q=80",
};

export default function Home() {
  const [destinations, setDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    fetch("/api/destinations")
      .then((response) => response.json())
      .then((data) => setDestinations(data.destinations ?? []))
      .catch(() => setDestinations([]));
  }, []);

  return (
    <main>
      <header className="fixed top-0 z-50 w-full border-b border-white/20 bg-[#10251f]/90 text-white backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="text-xl font-bold tracking-tight">Discover<span className="text-[#d9a441]">Lanka</span></a>
          <nav className="hidden gap-7 text-sm md:flex"><a href="#discover">Discover</a><a href="#experiences">Experiences</a><a href="#plan">Plan</a><a href="#stories">Stories</a><a href="#map">Map</a><a href="#my-trip">My Trip</a></nav>
          <a href="#plan" className="rounded-full bg-[#d9a441] px-5 py-2.5 text-sm font-bold text-[#10251f]">Build My Trip</a>
        </div>
      </header>

      <section id="top" className="relative flex min-h-[760px] items-end overflow-hidden bg-[#183d32] text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=2200&q=85')] bg-cover bg-center opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10251f] via-[#10251f]/35 to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-24 pt-40">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[.28em] text-[#e7c36e]">Sri Lanka, your way</p>
          <h1 className="max-w-4xl text-6xl font-semibold leading-[.95] tracking-[-.04em] md:text-8xl">Discover Sri Lanka.<br/><span className="text-[#e7c36e]">Plan Your Journey.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/80">From misty mountains to wild coastlines, find the places, experiences and stories that make your Sri Lanka unforgettable.</p>
          <div className="mt-9 flex flex-wrap gap-3"><a href="#plan" className="rounded-full bg-white px-7 py-3.5 font-bold text-[#10251f]">Start exploring</a><a href="#discover" className="rounded-full border border-white/40 px-7 py-3.5 font-semibold">Browse destinations</a></div>
        </div>
      </section>

      <section id="discover" className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-[#b27c1d]">Where to next?</p><h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Start with a place.</h2></div><p className="max-w-md text-[#66756f]">Destinations are now loaded from the DiscoverLanka database — ready to grow into full destination pages.</p></div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {destinations.slice(0, 6).map((d) => (
            <article key={d.id} className="group relative h-[420px] overflow-hidden rounded-3xl bg-[#183d32] text-white">
              <img src={destinationImages[d.slug] ?? destinationImages.kandy} alt={d.name} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute bottom-0 p-7"><p className="text-sm text-white/70">{d.region}</p><h3 className="mt-1 text-3xl font-semibold">{d.name}</h3><p className="mt-2 max-w-sm text-sm text-white/70">{d.summary}</p></div>
            </article>
          ))}
          {destinations.length === 0 && <div className="md:col-span-3 rounded-3xl border border-black/10 p-10 text-center text-[#66756f]">Loading Sri Lanka destinations…</div>}
        </div>
      </section>

      <section id="experiences" className="bg-[#183d32] px-6 py-24 text-white"><div className="mx-auto max-w-7xl"><p className="text-sm font-bold uppercase tracking-[.2em] text-[#e7c36e]">More than places</p><h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">Travel for the feeling, not just the photo.</h2><div className="mt-12 grid gap-4 md:grid-cols-4">{["Wild Sri Lanka","Food & flavour","Culture & heritage","Slow escapes"].map((x,i)=><div key={x} className="rounded-2xl border border-white/15 bg-white/5 p-6"><div className="mb-16 text-4xl">{["◒","◌","◈","⌁"][i]}</div><h3 className="text-xl font-semibold">{x}</h3><p className="mt-2 text-sm leading-6 text-white/60">Curated ideas for a richer journey.</p></div>)}</div></div></section>

      <section id="plan" className="px-6 py-24"><div className="mx-auto max-w-5xl rounded-[2rem] bg-[#e9e2d3] p-8 md:p-14"><p className="text-sm font-bold uppercase tracking-[.2em] text-[#8d651d]">Your journey starts here</p><h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">Where should you go?</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-[#66756f]">Tell us how you want to travel. We’ll help turn your interests, time and budget into a Sri Lankan journey worth remembering.</p><div className="mt-9 grid gap-3 sm:grid-cols-3"><button className="rounded-2xl bg-white p-5 text-left font-semibold shadow-sm">🏔️ Mountains<br/><span className="text-sm font-normal text-[#66756f]">Cool air & adventure</span></button><button className="rounded-2xl bg-white p-5 text-left font-semibold shadow-sm">🌊 Coast<br/><span className="text-sm font-normal text-[#66756f]">Beaches & sunsets</span></button><button className="rounded-2xl bg-white p-5 text-left font-semibold shadow-sm">🌿 Wild<br/><span className="text-sm font-normal text-[#66756f]">Nature & wildlife</span></button></div><button className="mt-5 rounded-full bg-[#183d32] px-7 py-3.5 font-bold text-white">Build my trip →</button></div></section>

      <section id="stories" className="border-t border-black/5 px-6 py-24"><div className="mx-auto max-w-7xl"><p className="text-sm font-bold uppercase tracking-[.2em] text-[#b27c1d]">Stories from the island</p><h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Go beyond the guidebook.</h2></div></section>

      <footer id="my-trip" className="bg-[#10251f] px-6 py-12 text-white"><div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between"><div><div className="text-xl font-bold">Discover<span className="text-[#d9a441]">Lanka</span></div><p className="mt-2 text-sm text-white/50">Discover Sri Lanka. Plan Your Journey.</p></div><div className="text-sm text-white/50">A new way to explore the island.</div></div></footer>
    </main>
  );
}
