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
  return <main className="premium-page min-h-screen bg-[#f6f2e9] text-[#10251f]"><header className="sticky top-0 z-30"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><a href="/" className="text-xl font-bold tracking-tight">Discover<span className="text-[#c7a66a]">Lanka</span></a><div className="flex items-center gap-4"><a href="/stories" className="text-sm font-semibold">Stories</a><a href="/plan" className="premium-button premium-button-dark text-white">Build My Trip →</a></div></div></header><section className="mx-auto max-w-7xl px-6 pb-24 pt-16 md:pt-28"><p className="premium-kicker">Experiences</p><h1 className="premium-display mt-5 max-w-5xl text-6xl md:text-8xl">Choose how you want Sri Lanka to feel.</h1><p className="premium-muted mt-7 max-w-2xl text-lg leading-8">Start with a feeling, then turn it into a route. Discover intimate moments, local flavours, wild encounters and slower ways to see the island.</p><div className="mt-14 grid gap-6 md:grid-cols-2">{loading && <div className="premium-card p-10 text-center premium-muted md:col-span-2">Loading experiences…</div>}{!loading && experiences.length===0 && <div className="premium-card p-10 text-center md:col-span-2">No experiences available yet.</div>}{experiences.map((x)=><article key={x.id} className="premium-card group overflow-hidden"><div className="relative h-80 overflow-hidden bg-[#ddd4c3]"><img src={images[x.slug] ?? imageFallback} alt={x.name} loading="lazy" decoding="async" onError={(event)=>{const target=event.currentTarget;if(target.src!==imageFallback)target.src=imageFallback}} className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#0c261f]/65 via-transparent to-transparent"/><span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#16382f]">{x.category||"Experience"}</span></div><div className="p-7"><div className="flex items-start justify-between gap-4"><div><h2 className="text-3xl font-semibold">{x.name}</h2><p className="premium-muted mt-3 leading-7">{x.summary||x.description}</p></div><span className="text-xl text-[#c7a66a]">{saved.includes(x.slug)?"♥":"♡"}</span></div>{x.destination_name&&<p className="mt-5 text-sm font-semibold text-[#8d7447]">Start in {x.destination_name}</p>}<div className="mt-7 flex flex-wrap gap-3"><button onClick={()=>save(x.slug)} className="premium-button border border-black/10 bg-[#f0ece2]">{saved.includes(x.slug)?"Saved":"Save experience"}</button><a href={`/plan?interest=${encodeURIComponent(x.category||"")}`} className="premium-button premium-button-dark text-white">Plan around this →</a></div></div></article>)}</div></section></main>;
}
