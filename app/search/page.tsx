"use client";

import { FormEvent, useEffect, useState } from "react";

type Destination = { id: string; slug: string; name: string; region: string; summary: string | null };
type Experience = { id: string; slug: string; name: string; category: string | null; summary: string | null };
type Story = { id: string; slug: string; title: string; excerpt: string | null; category: string | null };
type Results = { destinations: Destination[]; experiences: Experience[]; stories: Story[] };
const empty: Results = { destinations: [], experiences: [], stories: [] };

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function runSearch(value: string) {
    const q = value.trim();
    if (q.length < 2) { setResults(empty); setError(""); return; }
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`); const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Search failed");
      setResults({ destinations: data.destinations ?? [], experiences: data.experiences ?? [], stories: data.stories ?? [] });
    } catch { setResults(empty); setError("Search is unavailable right now."); } finally { setLoading(false); }
  }
  useEffect(() => { const timer = window.setTimeout(() => void runSearch(query), 280); return () => window.clearTimeout(timer); }, [query]);
  function submit(event: FormEvent) { event.preventDefault(); void runSearch(query); }
  const total = results.destinations.length + results.experiences.length + results.stories.length;
  return <main className="min-h-screen bg-[#f7f5ef] text-[#10251f]">
    <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f7f5ef]/95 backdrop-blur-md"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6"><a href="/" className="text-xl font-bold tracking-tight">Discover<span className="text-[#d9a441]">Lanka</span></a><nav className="hidden items-center gap-6 text-sm font-semibold text-[#66756f] md:flex"><a href="/search" className="text-[#183d32]">Search</a><a href="/experiences">Experiences</a><a href="/plan">Plan</a><a href="/stories">Stories</a><a href="/my-trip">My Trip</a></nav><a href="/plan" className="rounded-full bg-[#183d32] px-5 py-2.5 text-sm font-bold text-white">Build My Trip →</a></div></header>
    <section className="mx-auto max-w-5xl px-5 pb-20 pt-16 sm:px-6 md:pt-24"><p className="text-sm font-bold uppercase tracking-[.2em] text-[#b27c1d]">Search Sri Lanka</p><h1 className="mt-3 text-5xl font-semibold tracking-[-.04em] md:text-7xl">Find your next place, feeling or story.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#66756f]">Search destinations, experiences and published stories from the DiscoverLanka guide.</p>
      <form onSubmit={submit} className="mt-10 flex flex-col gap-3 sm:flex-row"><label htmlFor="search" className="sr-only">Search DiscoverLanka</label><input id="search" autoFocus value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Try Kandy, wildlife, coast, food…" className="min-h-14 flex-1 rounded-2xl border border-black/10 bg-white px-5 text-base shadow-sm outline-none placeholder:text-[#96a29d] focus:border-[#183d32] focus:ring-4 focus:ring-[#183d32]/5"/><button type="submit" className="min-h-14 rounded-2xl bg-[#183d32] px-7 font-bold text-white hover:bg-[#10251f]">Search</button></form>
      <div className="mt-8 flex min-h-6 items-center justify-between text-sm text-[#66756f]"><span>{query.trim().length >= 2 ? `${total} result${total === 1 ? "" : "s"}` : "Type at least 2 characters to search"}</span>{loading&&<span>Searching…</span>}</div>
      {error?<div className="mt-6 rounded-[2rem] bg-[#e9e2d3] p-8">{error}</div>:query.trim().length<2?<div className="mt-6 rounded-[2rem] border border-black/5 bg-white p-9 shadow-sm"><p className="text-lg font-semibold">Search the whole guide.</p><p className="mt-2 text-[#66756f]">Find destinations, experiences and stories in one place.</p></div>:!loading&&total===0?<div className="mt-6 rounded-[2rem] bg-white p-9 shadow-sm"><h2 className="text-2xl font-semibold">No matches yet.</h2><p className="mt-2 text-[#66756f]">Try a place name, region, category or travel interest.</p></div>:<div className="mt-6 space-y-10">
        {results.destinations.length>0&&<section><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">Explore</p><h2 className="text-3xl font-semibold">Destinations</h2></div><span className="text-sm text-[#66756f]">{results.destinations.length}</span></div><div className="grid gap-4 md:grid-cols-2">{results.destinations.map(item=><a key={item.id} href={`/destinations/${item.slug}`} className="group rounded-[1.5rem] border border-black/5 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">{item.region}</p><h3 className="mt-2 text-2xl font-semibold">{item.name}</h3><p className="mt-2 leading-7 text-[#66756f]">{item.summary}</p><span className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#183d32]">Explore destination <span className="ml-2 transition group-hover:translate-x-1">→</span></span></a>)}</div></section>}
        {results.experiences.length>0&&<section><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">Feel</p><h2 className="text-3xl font-semibold">Experiences</h2></div><span className="text-sm text-[#66756f]">{results.experiences.length}</span></div><div className="grid gap-4 md:grid-cols-2">{results.experiences.map(item=><a key={item.id} href={`/experiences/${item.slug}`} className="group rounded-[1.5rem] bg-[#183d32] p-6 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><p className="text-xs font-bold uppercase tracking-widest text-[#e7c36e]">{item.category??"Experience"}</p><h3 className="mt-2 text-2xl font-semibold">{item.name}</h3><p className="mt-2 leading-7 text-white/65">{item.summary}</p><span className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#e7c36e]">Explore experience <span className="ml-2 transition group-hover:translate-x-1">→</span></span></a>)}</div></section>}
        {results.stories.length>0&&<section><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">Read</p><h2 className="text-3xl font-semibold">Stories</h2></div><span className="text-sm text-[#66756f]">{results.stories.length}</span></div><div className="grid gap-4 md:grid-cols-2">{results.stories.map(item=><a key={item.id} href={`/stories/${item.slug}`} className="group rounded-[1.5rem] border border-black/5 bg-[#f1eee6] p-6 transition hover:-translate-y-1 hover:bg-white"><p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">{item.category??"Sri Lanka"}</p><h3 className="mt-2 text-2xl font-semibold">{item.title}</h3><p className="mt-2 leading-7 text-[#66756f]">{item.excerpt}</p><span className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#183d32]">Read story <span className="ml-2 transition group-hover:translate-x-1">→</span></span></a>)}</div></section>}
      </div>}
    </section>
  </main>;
}
