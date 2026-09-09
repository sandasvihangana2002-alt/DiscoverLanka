"use client";

import { useEffect, useMemo, useState } from "react";

const places = [
  { slug: "kandy", name: "Kandy", region: "Central", image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=80", text: "Culture, temples and mountain atmosphere." },
  { slug: "ella", name: "Ella", region: "Hill Country", image: "https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=900&q=80", text: "Tea country, hikes and slow mountain days." },
  { slug: "galle", name: "Galle", region: "South Coast", image: "https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=900&q=80", text: "Fort walls, cafés and coastal sunsets." },
  { slug: "sigiriya", name: "Sigiriya", region: "Cultural Triangle", image: "https://images.unsplash.com/photo-1588598198321-9735fd5246b8?auto=format&fit=crop&w=900&q=80", text: "Ancient history, dramatic rock and jungle." },
  { slug: "yala", name: "Yala", region: "Wild Sri Lanka", image: "https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=900&q=80", text: "Wildlife, safari and wide open landscapes." },
  { slug: "mirissa", name: "Mirissa", region: "South Coast", image: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=900&q=80", text: "Beach time, palms and ocean adventures." },
];

export default function MyTripPage() {
  const [saved, setSaved] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const value = JSON.parse(localStorage.getItem("discoverlanka-saved") ?? "[]");
      if (Array.isArray(value)) setSaved(value);
    } catch {}
  }, []);

  const selectedPlaces = useMemo(() => saved.map((slug) => places.find((place) => place.slug === slug)).filter(Boolean), [saved]);

  function remove(slug: string) {
    const next = saved.filter((item) => item !== slug);
    setSaved(next);
    localStorage.setItem("discoverlanka-saved", JSON.stringify(next));
  }

  function clearTrip() {
    setSaved([]);
    localStorage.removeItem("discoverlanka-saved");
  }

  async function shareTrip() {
    const text = selectedPlaces.length ? `My DiscoverLanka trip: ${selectedPlaces.map((p) => p!.name).join(" → ")}` : "My DiscoverLanka trip";
    try {
      if (navigator.share) await navigator.share({ title: "My DiscoverLanka Trip", text });
      else { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    } catch {}
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#10251f]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f7f5ef]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="text-xl font-bold tracking-tight">Discover<span className="text-[#d9a441]">Lanka</span></a>
          <div className="flex items-center gap-4"><a href="/plan" className="text-sm font-semibold text-[#66756f]">Plan trip</a><a href="/" className="text-sm font-semibold text-[#66756f]">← Discover</a></div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-16 md:pt-24">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div><p className="text-sm font-bold uppercase tracking-[.2em] text-[#b27c1d]">My Trip</p><h1 className="mt-3 text-5xl font-semibold tracking-[-.04em] md:text-7xl">Your Sri Lankan journey.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#66756f]">Keep the places you love in one simple trip list, then turn them into a route with the Trip Builder.</p></div>
          <div className="flex flex-wrap gap-3"><button onClick={shareTrip} disabled={!saved.length} className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40">{copied ? "Copied ✓" : "Share trip"}</button><a href="/plan" className="rounded-full bg-[#183d32] px-6 py-3 text-sm font-bold text-white">Build route →</a></div>
        </div>

        {selectedPlaces.length === 0 ? (
          <div className="mt-14 rounded-[2rem] bg-[#e9e2d3] p-10 text-center md:p-16"><div className="text-5xl">♡</div><h2 className="mt-5 text-3xl font-semibold">Your trip is waiting for a first place.</h2><p className="mx-auto mt-3 max-w-xl leading-7 text-[#66756f]">Explore destinations and save the places that catch your eye. They’ll stay in this browser while you shape your journey.</p><a href="/" className="mt-7 inline-block rounded-full bg-[#d9a441] px-7 py-3.5 font-bold">Explore destinations →</a></div>
        ) : (
          <>
            <div className="mt-12 flex items-center justify-between border-b border-black/10 pb-5"><p className="font-semibold">{selectedPlaces.length} {selectedPlaces.length === 1 ? "place" : "places"} saved</p><button onClick={clearTrip} className="text-sm font-semibold text-[#8d651d]">Clear all</button></div>
            <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{selectedPlaces.map((d, index) => d && <article key={d.slug} className="overflow-hidden rounded-3xl bg-white shadow-sm"><div className="relative h-56"><img src={d.image} alt={d.name} className="h-full w-full object-cover"/><span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold">Stop {index + 1}</span><button onClick={() => remove(d.slug)} className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#183d32]">Remove</button></div><div className="p-6"><p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">{d.region}</p><h2 className="mt-1 text-2xl font-semibold">{d.name}</h2><p className="mt-2 text-sm leading-6 text-[#66756f]">{d.text}</p><a href={`/destinations/${d.slug}`} className="mt-5 inline-block text-sm font-bold text-[#183d32]">Explore {d.name} →</a></div></article>)}</div>
            <div className="mt-10 rounded-[2rem] bg-[#183d32] p-8 text-white md:flex md:items-center md:justify-between md:p-10"><div><p className="text-sm font-bold uppercase tracking-widest text-[#e7c36e]">Next step</p><h2 className="mt-2 text-3xl font-semibold">Turn saved places into a route.</h2><p className="mt-2 max-w-xl text-white/60">Choose your days, interests and travel style. The Trip Builder will suggest a starting route using your saved places.</p></div><a href="/plan" className="mt-6 inline-block shrink-0 rounded-full bg-[#d9a441] px-7 py-3.5 font-bold text-[#10251f] md:mt-0">Build my trip →</a></div>
          </>
        )}
      </section>
    </main>
  );
}
