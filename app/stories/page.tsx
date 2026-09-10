"use client";

import { useEffect, useState } from "react";

type Story = { id: string; slug: string; title: string; excerpt: string; content: string; category: string; published_at: string | null };

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/stories").then((r) => r.json()).then((d) => setStories(d.stories ?? [])).catch(() => setStories([])).finally(() => setLoading(false));
  }, []);

  return <main className="min-h-screen bg-[#f7f5ef] text-[#10251f]">
    <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f7f5ef]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <a href="/" className="text-xl font-bold tracking-tight">Discover<span className="text-[#d9a441]">Lanka</span></a>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-[#66756f] md:flex"><a href="/search">Search</a><a href="/experiences">Experiences</a><a href="/plan">Plan</a><a href="/stories" className="text-[#183d32]">Stories</a><a href="/my-trip">My Trip</a></nav>
        <a href="/plan" className="rounded-full bg-[#183d32] px-5 py-2.5 text-sm font-bold text-white">Build My Trip →</a>
      </div>
    </header>
    <section className="mx-auto max-w-7xl px-5 pb-14 pt-16 sm:px-6 md:pt-24">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-[#b27c1d]">Stories from the island</p>
      <h1 className="mt-3 max-w-4xl text-5xl font-semibold tracking-[-.04em] md:text-7xl">Go beyond the guidebook.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-[#66756f]">Ideas, places and local perspectives to help you travel Sri Lanka with more curiosity.</p>
    </section>
    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-6"><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {loading && <div className="md:col-span-3 rounded-[2rem] bg-white p-12 text-center text-[#66756f] shadow-sm">Loading stories…</div>}
      {!loading && stories.length === 0 && <div className="md:col-span-3 rounded-[2rem] bg-[#e9e2d3] p-12 text-center"><h2 className="text-3xl font-semibold">The first stories are on their way.</h2><p className="mx-auto mt-3 max-w-xl leading-7 text-[#66756f]">New editorial stories are being added while destinations and trip planning stay ready for you.</p><a href="/plan" className="mt-7 inline-block rounded-full bg-[#183d32] px-7 py-3.5 font-bold text-white">Plan a journey →</a></div>}
      {stories.map((story) => <article key={story.id} className="group overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"><div className="h-1.5 bg-[#d9a441]"/><div className="p-7"><p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">{story.category || "Sri Lanka"}</p><h2 className="mt-3 text-3xl font-semibold leading-tight">{story.title}</h2><p className="mt-4 text-sm leading-7 text-[#66756f]">{story.excerpt || story.content.slice(0, 150)}</p><a href={`/stories/${story.slug}`} className="mt-6 inline-flex min-h-11 items-center text-sm font-bold text-[#183d32]">Read story <span className="ml-2 transition group-hover:translate-x-1">→</span></a></div></article>)}
    </div></section>
  </main>;
}
