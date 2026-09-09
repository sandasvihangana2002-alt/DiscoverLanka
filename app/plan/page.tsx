"use client";

import { useEffect, useMemo, useState } from "react";

type Destination = { id: string; slug: string; name: string; region: string; summary: string; image: string; latitude: number; longitude: number };

const destinationImages: Record<string, string> = {
  kandy: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=80",
  ella: "https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=900&q=80",
  galle: "https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=900&q=80",
  sigiriya: "https://images.unsplash.com/photo-1588598198321-9735fd5246b8?auto=format&fit=crop&w=900&q=80",
  yala: "https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=900&q=80",
  mirissa: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=900&q=80",
  "nuwara-eliya": "https://images.unsplash.com/photo-1590123221594-8c5d2c5f3f44?auto=format&fit=crop&w=900&q=80",
  anuradhapura: "https://images.unsplash.com/photo-1588258524675-c7f1e3e8d5d8?auto=format&fit=crop&w=900&q=80",
};

const interests = ["Mountains", "Coast", "Wildlife", "Culture", "Food", "Slow travel"];
const budgets = ["Budget", "Comfort", "Premium"];

export default function PlanPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [interest, setInterest] = useState("Mountains");
  const [budget, setBudget] = useState("Comfort");
  const [selected, setSelected] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/destinations")
      .then((r) => r.json())
      .then((data) => {
        const rows = Array.isArray(data.destinations) ? data.destinations : [];
        setDestinations(rows.map((d: Omit<Destination, "image">) => ({ ...d, image: destinationImages[d.slug] ?? destinationImages.kandy })));
      })
      .catch(() => setDestinations([]))
      .finally(() => setLoading(false));

    try {
      const savedPlaces = JSON.parse(localStorage.getItem("discoverlanka-saved") ?? "[]");
      if (Array.isArray(savedPlaces)) {
        setSaved(savedPlaces);
        setSelected(savedPlaces);
      }
    } catch {}

    const params = new URLSearchParams(window.location.search);
    const requestedInterest = params.get("interest");
    if (requestedInterest) {
      const match = interests.find((item) => item.toLowerCase() === requestedInterest.toLowerCase());
      if (match) setInterest(match);
    }
  }, []);

  const suggested = useMemo(() => {
    const orders: Record<string, string[]> = {
      Coast: ["galle", "mirissa", "ella", "kandy"],
      Wildlife: ["yala", "ella", "kandy", "mirissa"],
      Culture: ["sigiriya", "kandy", "anuradhapura", "galle"],
      Food: ["kandy", "galle", "mirissa", "ella"],
      "Slow travel": ["ella", "nuwara-eliya", "galle", "mirissa"],
      Mountains: ["ella", "kandy", "nuwara-eliya", "sigiriya"],
    };
    const order = orders[interest] ?? orders.Mountains;
    const fallback = destinations.filter((d) => !order.includes(d.slug));
    const ordered = [...order.map((slug) => destinations.find((d) => d.slug === slug)).filter(Boolean) as Destination[], ...fallback];
    return ordered.slice(0, days >= 10 ? 4 : 3);
  }, [interest, days, destinations]);

  function persist(next: string[]) {
    setSelected(next);
    setSaved(next);
    localStorage.setItem("discoverlanka-saved", JSON.stringify(next));
  }

  function toggleDestination(slug: string) {
    const next = selected.includes(slug) ? selected.filter((x) => x !== slug) : [...selected, slug];
    persist(next);
    setGenerated(false);
  }

  function generateTrip() {
    const next = suggested.map((d) => d.slug);
    persist(next);
    setGenerated(true);
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#10251f]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f7f5ef]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"><a href="/" className="text-xl font-bold tracking-tight">Discover<span className="text-[#d9a441]">Lanka</span></a><div className="flex items-center gap-5"><span className="hidden text-sm text-[#66756f] sm:inline">♥ {saved.length} saved</span><a href="/" className="text-sm font-semibold text-[#66756f]">← Back to Discover</a></div></div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 md:pt-24">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-[#b27c1d]">Trip Builder</p>
        <h1 className="mt-3 max-w-4xl text-5xl font-semibold tracking-[-.04em] md:text-7xl">Build a Sri Lankan journey that feels like yours.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#66756f]">Choose your pace, interests and budget. Your choices are saved in this browser so you can keep shaping the journey.</p>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-[2rem] bg-white p-7 shadow-sm md:p-10">
            <label className="text-sm font-bold uppercase tracking-widest text-[#8d651d]">How many days?</label>
            <div className="mt-4 flex flex-wrap gap-2">{[3, 5, 7, 10, 14].map((value) => <button key={value} onClick={() => { setDays(value); setGenerated(false); }} className={`rounded-full px-5 py-3 text-sm font-bold ${days === value ? "bg-[#183d32] text-white" : "bg-[#f1eee6] text-[#183d32]"}`}>{value} days</button>)}</div>

            <div className="mt-10"><label className="text-sm font-bold uppercase tracking-widest text-[#8d651d]">What are you into?</label><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{interests.map((item) => <button key={item} onClick={() => { setInterest(item); setGenerated(false); }} className={`rounded-2xl border p-4 text-left font-semibold ${interest === item ? "border-[#183d32] bg-[#183d32] text-white" : "border-black/10 bg-[#f7f5ef]"}`}>{item}</button>)}</div></div>

            <div className="mt-10"><label className="text-sm font-bold uppercase tracking-widest text-[#8d651d]">Travel style</label><div className="mt-4 grid gap-3 sm:grid-cols-3">{budgets.map((item) => <button key={item} onClick={() => { setBudget(item); setGenerated(false); }} className={`rounded-2xl border p-4 text-left font-semibold ${budget === item ? "border-[#183d32] bg-[#183d32] text-white" : "border-black/10 bg-[#f7f5ef]"}`}>{item}</button>)}</div></div>

            <button onClick={generateTrip} disabled={loading || destinations.length === 0} className="mt-10 w-full rounded-full bg-[#d9a441] px-7 py-4 font-bold text-[#10251f] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Loading destinations…" : "Generate my trip →"}</button>
          </section>

          <aside className="h-fit rounded-[2rem] bg-[#183d32] p-7 text-white md:p-8"><p className="text-sm font-bold uppercase tracking-widest text-[#e7c36e]">Your trip</p><h2 className="mt-3 text-3xl font-semibold">{days} days · {budget}</h2><p className="mt-2 text-white/60">Focus: {interest}</p><div className="mt-8 border-t border-white/10 pt-6"><p className="text-sm font-semibold text-white/70">Suggested route</p><div className="mt-4 space-y-3">{suggested.map((d, index) => <div key={d.slug} className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs">{index + 1}</span><span>{d.name}</span></div>)}{!loading && suggested.length === 0 && <p className="text-sm text-white/50">No destinations available yet.</p>}</div></div>{generated && <p className="mt-7 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-white/80">Starter itinerary saved. Your selected stops are ready to shape below.</p>}</aside>
        </div>

        <section className="mt-10 rounded-[2rem] bg-[#e9e2d3] p-7 md:p-10"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-bold uppercase tracking-widest text-[#8d651d]">Shape your route</p><h2 className="mt-2 text-3xl font-semibold">Choose your stops</h2></div><p className="text-sm text-[#66756f]">{selected.length} selected</p></div>{loading ? <div className="mt-7 rounded-3xl bg-white p-10 text-center text-[#66756f]">Loading Sri Lanka destinations…</div> : <><div className="mt-7 grid gap-4 md:grid-cols-3">{destinations.map((d) => <button key={d.id} onClick={() => toggleDestination(d.slug)} className={`group overflow-hidden rounded-3xl bg-white text-left ${selected.includes(d.slug) ? "ring-2 ring-[#d9a441]" : ""}`}><div className="relative h-44"><img src={d.image} alt={d.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/><span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#183d32]">{selected.includes(d.slug) ? "Selected" : "Add"}</span></div><div className="p-5"><p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">{d.region}</p><h3 className="mt-1 text-xl font-semibold">{d.name}</h3><p className="mt-2 text-sm leading-6 text-[#66756f]">{d.summary}</p></div></button>)}</div><div className="mt-8 flex flex-wrap gap-3">{selected.map((slug) => { const d = destinations.find((x) => x.slug === slug); return d ? <a key={slug} href={`/destinations/${slug}`} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold">View {d.name} →</a> : null; })}</div></>}</section>
      </section>
    </main>
  );
}
