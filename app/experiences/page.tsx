"use client";

import { useState } from "react";

const experiences = [
  { slug: "wildlife", title: "Wild Sri Lanka", category: "Wildlife", text: "Safaris, forests and unforgettable encounters with the island's wild side.", places: "Yala · Udawalawe · Wilpattu", image: "https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=1400&q=85" },
  { slug: "food", title: "Food & flavour", category: "Food", text: "Markets, local kitchens and the dishes that tell Sri Lankan stories.", places: "Kandy · Colombo · Galle", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1400&q=85" },
  { slug: "culture", title: "Culture & heritage", category: "Culture", text: "Temples, ancient cities, crafts and living traditions across the island.", places: "Kandy · Sigiriya · Anuradhapura", image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=85" },
  { slug: "slow", title: "Slow escapes", category: "Slow travel", text: "Tea country, quiet beaches and days with nowhere to rush.", places: "Ella · Nuwara Eliya · Mirissa", image: "https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=1400&q=85" },
];

export default function ExperiencesPage() {
  const [saved, setSaved] = useState<string[]>([]);
  function save(slug: string) {
    const next = saved.includes(slug) ? saved.filter((x) => x !== slug) : [...saved, slug];
    setSaved(next);
    localStorage.setItem("discoverlanka-experiences", JSON.stringify(next));
  }
  return <main className="min-h-screen bg-[#f7f5ef] text-[#10251f]"><header className="border-b border-black/10 bg-[#f7f5ef]/95"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><a href="/" className="text-xl font-bold">Discover<span className="text-[#d9a441]">Lanka</span></a><a href="/plan" className="rounded-full bg-[#183d32] px-5 py-2.5 text-sm font-bold text-white">Build My Trip →</a></div></header><section className="mx-auto max-w-7xl px-6 pb-20 pt-20"><p className="text-sm font-bold uppercase tracking-[.2em] text-[#b27c1d]">Experiences</p><h1 className="mt-3 max-w-4xl text-5xl font-semibold tracking-[-.04em] md:text-7xl">Choose how you want Sri Lanka to feel.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#66756f]">Start with a feeling, then turn it into a route. Save the experiences you like and build your journey around them.</p><div className="mt-12 grid gap-6 md:grid-cols-2">{experiences.map((x)=><article key={x.slug} className="overflow-hidden rounded-[2rem] bg-white shadow-sm"><div className="relative h-72"><img src={x.image} alt={x.title} className="h-full w-full object-cover"/><span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider">{x.category}</span></div><div className="p-7"><h2 className="text-3xl font-semibold">{x.title}</h2><p className="mt-3 leading-7 text-[#66756f]">{x.text}</p><p className="mt-4 text-sm font-semibold text-[#8d651d]">{x.places}</p><div className="mt-6 flex flex-wrap gap-3"><button onClick={()=>save(x.slug)} className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-bold">{saved.includes(x.slug) ? "♥ Saved" : "♡ Save experience"}</button><a href={`/plan?interest=${encodeURIComponent(x.category)}`} className="rounded-full bg-[#183d32] px-5 py-2.5 text-sm font-bold text-white">Plan around this →</a></div></div></article>)}</div></section></main>;
}
