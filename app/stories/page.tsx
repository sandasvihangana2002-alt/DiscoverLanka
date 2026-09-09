"use client";

import { useEffect, useState } from "react";

type Story = { id: string; slug: string; title: string; excerpt: string; content: string; category: string; published_at: string | null };

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stories").then((r) => r.json()).then((d) => setStories(d.stories ?? [])).catch(() => setStories([])).finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#10251f]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f7f5ef]/95 backdrop-blur-md"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"><a href="/" className="text-xl font-bold tracking-tight">Discover<span className="text-[#d9a441]">Lanka</span></a><div className="flex gap-5 text-sm font-semibold text-[#66756f]"><a href="/">Discover</a><a href="/experiences">Experiences</a><a href="/plan">Plan</a><a href="/my-trip">My Trip</a></div></div></header>
      <section className="mx-auto max-w-7xl px-6 pb-14 pt-16 md:pt-24"><p className="text-sm font-bold uppercase tracking-[.2em] text-[#b27c1d]">Stories from the island</p><h1 className="mt-3 max-w-4xl text-5xl font-semibold tracking-[-.04em] md:text-7xl">Go beyond the guidebook.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#66756f]">Ideas, places and local perspectives to help you travel Sri Lanka with more curiosity.</p></section>
      <section className="mx-auto max-w-7xl px-6 pb-24"><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {loading && <div className="md:col-span-3 rounded-3xl bg-white p-10 text-center text-[#66756f]">Loading stories…</div>}
        {!loading && stories.length === 0 && <div className="md:col-span-3 rounded-[2rem] bg-[#e9e2d3] p-12 text-center"><h2 className="text-3xl font-semibold">The first stories are on their way.</h2><p className="mx-auto mt-3 max-w-xl leading-7 text-[#66756f]">There are no published articles in the DiscoverLanka database yet. Destinations and trip planning are ready while we build the editorial collection.</p><a href="/plan" className="mt-7 inline-block rounded-full bg-[#183d32] px-7 py-3.5 font-bold text-white">Plan a journey →</a></div>}
        {stories.map((story) => <article key={story.id} className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1"><div className="h-2 bg-[#d9a441]"/><div className="p-7"><p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">{story.category || "Sri Lanka"}</p><h2 className="mt-3 text-2xl font-semibold leading-tight">{story.title}</h2><p className="mt-4 text-sm leading-7 text-[#66756f]">{story.excerpt || story.content.slice(0, 150)}</p><a href={`/stories/${story.slug}`} className="mt-6 inline-block text-sm font-bold text-[#183d32]">Read story →</a></div></article>)}
      </div></section>
    </main>
  );
}
