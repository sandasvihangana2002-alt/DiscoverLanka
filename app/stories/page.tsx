"use client";

import { useEffect, useState } from "react";

type Story = { id: string; slug: string; title: string; excerpt: string; content: string; category: string; published_at: string | null };

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/stories").then((r)=>r.json()).then((d)=>setStories(d.stories??[])).catch(()=>setStories([])).finally(()=>setLoading(false)); }, []);
  return <main className="premium-page min-h-screen bg-[#f6f2e9] text-[#10251f]">
    <header className="sticky top-0 z-30"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><a href="/" className="text-xl font-bold tracking-tight">Discover<span className="text-[#c7a66a]">Lanka</span></a><div className="flex items-center gap-4 text-sm font-semibold"><a href="/experiences">Experiences</a><a href="/plan">Plan</a><a href="/my-trip">My Trip</a></div></div></header>
    <section className="mx-auto max-w-7xl px-6 pb-24 pt-16 md:pt-28"><p className="premium-kicker">Stories from the island</p><h1 className="premium-display mt-5 max-w-5xl text-6xl md:text-8xl">Go beyond the guidebook.</h1><p className="premium-muted mt-7 max-w-2xl text-lg leading-8">Ideas, places and local perspectives to help you travel Sri Lanka with more curiosity — and a little more intention.</p>
      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading&&<div className="premium-card p-10 text-center premium-muted lg:col-span-3">Loading stories…</div>}
        {!loading&&stories.length===0&&<div className="premium-card p-12 text-center lg:col-span-3"><p className="premium-kicker">Editorial collection</p><h2 className="mt-3 text-3xl">The first stories are on their way.</h2><p className="premium-muted mx-auto mt-3 max-w-xl leading-7">Destinations and trip planning are ready while we grow the DiscoverLanka journal.</p><a href="/plan" className="premium-button premium-button-dark mt-7 text-white">Plan a journey →</a></div>}
        {stories.map((story,index)=><article key={story.id} className={`premium-card group overflow-hidden ${index===0?"lg:row-span-2":""}`}><div className={`relative overflow-hidden bg-[#16382f] ${index===0?"h-[26rem] lg:h-[38rem]":"h-60"}`}><div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=85')] bg-cover bg-center opacity-55 transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#0c261f]/80 via-transparent to-transparent"/><p className="absolute bottom-5 left-6 premium-kicker !text-[#e7c98b]">{story.category||"Sri Lanka"}</p></div><div className="p-7"><p className="premium-kicker">{story.category||"Sri Lanka"}</p><h2 className="mt-3 text-3xl font-semibold leading-tight">{story.title}</h2><p className="premium-muted mt-4 leading-7">{story.excerpt||story.content.slice(0,180)}</p><a href={`/stories/${story.slug}`} className="mt-6 inline-flex text-sm font-bold text-[#16382f]">Read story →</a></div></article>)}
      </div>
    </section>
  </main>;
}
