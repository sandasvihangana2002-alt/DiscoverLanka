"use client";

import { useEffect, useState } from "react";

type Experience = { id: string; slug: string; name: string; category: string | null; summary: string | null; description: string | null; destination_name: string | null };
const images: Record<string, string> = {
  wildlife: "https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=1400&q=85",
  food: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1400&q=85",
  culture: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=85",
  slow: "https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=900&q=80",
};
const imageFallback = "https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=900&q=80";

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/experiences").then((r) => r.json()).then((d) => setExperiences(d.experiences ?? [])).catch(() => setExperiences([])).finally(() => setLoading(false));
    try { setSaved(JSON.parse(localStorage.getItem("discoverlanka-experiences") ?? "[]")); } catch {}
  }, []);
  function save(slug: string) { setSaved((current) => { const next = current.includes(slug) ? current.filter((x) => x !== slug) : [...current, slug]; localStorage.setItem("discoverlanka-experiences", JSON.stringify(next)); return next; }); }
  return <main className="min-h-screen bg-[#f7f5ef] text-[#10251f]">
    <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f7f5ef]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <a href="/" className="text-xl font-bold tracking-tight">Discover<span className="text-[#d9a441]">Lanka</span></a>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-[#66756f] md:flex"><a href="/search">Search</a><a href="/experiences" className="text-[#183d32]">Experiences</a><a href="/plan">Plan</a><a href="/stories">Stories</a><a href="/my-trip">My Trip</a></nav>
        <a href="/plan" className="rounded-full bg-[#183d32] px-5 py-2.5 text-sm font-bold text-white">Build My Trip →</a>
      </div>
    </header>
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-6 md:pt-24">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-[#b27c1d]">Experiences</p>
      <h1 className="mt-3 max-w-4xl text-5xl font-semibold tracking-[-.04em] md:text-7xl">Choose how you want Sri Lanka to feel.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-[#66756f]">Start with a feeling, then turn it into a route. Save the experiences you like and build your journey around them.</p>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {loading && <div className="md:col-span-2 rounded-[2rem] bg-white p-12 text-center text-[#66756f] shadow-sm">Loading experiences…</div>}
        {!loading && experiences.length === 0 && <div className="md:col-span-2 rounded-[2rem] bg-[#e9e2d3] p-12 text-center"><h2 className="text-3xl font-semibold">No experiences available yet.</h2><p className="mt-3 text-[#66756f]">The guide is growing. Start by building a journey around a destination.</p><a href="/plan" className="mt-6 inline-block rounded-full bg-[#183d32] px-6 py-3 font-bold text-white">Build my trip →</a></div>}
        {experiences.map((x)=><article key={x.id} className="group overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="relative h-72 bg-[#e9e2d3]"><img src={images[x.slug] ?? imageFallback} alt={x.name} loading="lazy" decoding="async" onError={(event) => { const target = event.currentTarget; if (target.src !== imageFallback) target.src = imageFallback; }} className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#10251f]/55 via-transparent to-transparent"/><span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider">{x.category || "Experience"}</span></div>
          <div className="p-7"><h2 className="text-3xl font-semibold">{x.name}</h2><p className="mt-3 leading-7 text-[#66756f]">{x.summary || x.description}</p>{x.destination_name && <p className="mt-4 text-sm font-semibold text-[#8d651d]">Start in {x.destination_name}</p>}<div className="mt-6 flex flex-wrap gap-3"><button onClick={()=>save(x.slug)} className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-bold hover:border-[#183d32]">{saved.includes(x.slug) ? "♥ Saved" : "♡ Save experience"}</button><a href={`/experiences/${x.slug}`} className="rounded-full border border-[#183d32] px-5 py-2.5 text-sm font-bold text-[#183d32]">View details</a><a href={`/plan?interest=${encodeURIComponent(x.category || "")}`} className="rounded-full bg-[#183d32] px-5 py-2.5 text-sm font-bold text-white">Plan around this →</a></div></div>
        </article>)}
      </div>
    </section>
  </main>;
}
