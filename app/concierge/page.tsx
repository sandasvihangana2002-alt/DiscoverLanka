"use client";

import { useMemo, useState } from "react";

const interests = ["Mountains", "Coast", "Wildlife", "Culture", "Food", "Slow travel"];
const budgets = ["Budget", "Comfort", "Premium"];
const paces = ["Slow", "Balanced", "Fast"];
const starts = ["Colombo", "Airport", "Kandy", "Galle", "Ella", "Flexible"];

type Place = { id: string; slug: string; name: string; region: string; summary: string; best_time: string; latitude: number; longitude: number };
type Experience = { slug: string; name: string; category: string | null; summary: string | null; destination_slug: string | null; destination_name: string | null };
type Result = { aiPowered: boolean; profile: { days: number; travelers: number; interests: string[]; budget: string; pace: string; startingPoint: string }; route: Place[]; experiences: Experience[]; narrative: string; estimatedDailyRate: number; routeSlugs: string[] };

const images: Record<string, string> = {
  kandy: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=86",
  ella: "https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=900&q=86",
  galle: "https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=900&q=86",
  sigiriya: "https://images.unsplash.com/photo-1588598198321-9735fd5246b8?auto=format&fit=crop&w=900&q=86",
  yala: "https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=900&q=86",
  mirissa: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=900&q=86",
  "nuwara-eliya": "https://images.unsplash.com/photo-1590123221594-8c5d2c5f3f44?auto=format&fit=crop&w=900&q=86",
  anuradhapura: "https://images.unsplash.com/photo-1588258524675-c7f1e3e8d5d8?auto=format&fit=crop&w=900&q=86",
};

export default function ConciergePage() {
  const [step, setStep] = useState(1);
  const [days, setDays] = useState(7);
  const [travelers, setTravelers] = useState(2);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Mountains", "Food"]);
  const [budget, setBudget] = useState("Comfort");
  const [pace, setPace] = useState("Balanced");
  const [startingPoint, setStartingPoint] = useState("Flexible");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const progress = useMemo(() => `${Math.round((step / 4) * 100)}%`, [step]);

  const toggleInterest = (value: string) => {
    setSelectedInterests((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value].slice(0, 4));
  };

  async function buildJourney() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/concierge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ days, travelers, interests: selectedInterests, budget, pace, startingPoint }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not build journey");
      setResult(data as Result); setStep(5);
      localStorage.setItem("discoverlanka-concierge", JSON.stringify(data));
      localStorage.setItem("discoverlanka-saved", JSON.stringify(data.routeSlugs));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not build journey"); }
    finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen px-5 pb-24 pt-24 text-[#f4efe6] sm:px-8 md:pt-28">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between gap-4">
          <a href="/" className="text-xl font-bold tracking-tight">Discover<span className="text-[#d8b875]">Lanka</span></a>
          <a href="/my-trip" className="rounded-full border border-white/15 bg-white/[.04] px-4 py-2 text-sm font-semibold">My Trip →</a>
        </header>

        <section className="route-hero-panel overflow-hidden">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="luxury-section-eyebrow">DiscoverLanka Concierge</p>
              <h1 className="luxury-display-small mt-4 text-5xl md:text-7xl">Tell us how you want Sri Lanka to feel.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 md:text-lg">A smart concierge shapes a route around your time, taste, pace and budget — then turns it into a journey you can keep refining.</p>
            </div>
            <div className="w-full max-w-sm">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.2em] text-white/45"><span>Journey profile</span><span>{step < 5 ? progress : "Complete"}</span></div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-[#d8b875] transition-all duration-700" style={{ width: step < 5 ? progress : "100%" }} /></div>
            </div>
          </div>

          {step < 5 ? <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_290px]">
            <div className="luxury-glass rounded-[26px] p-6 sm:p-8">
              {step === 1 && <div><p className="luxury-section-eyebrow">Step 01</p><h2 className="mt-3 text-3xl font-semibold">How long are you disappearing for?</h2><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-5">{[3,5,7,10,14].map((value) => <button key={value} onClick={() => setDays(value)} className={`rounded-2xl border p-4 text-left transition ${days === value ? "border-[#d8b875]/50 bg-[#d8b875]/12" : "border-white/10 bg-white/[.03]"}`}><span className="text-xl font-semibold">{value}</span><span className="mt-1 block text-xs text-white/45">days</span></button>)}</div><div className="mt-9 flex items-center gap-4"><span className="text-sm text-white/55">Travellers</span><button onClick={() => setTravelers(Math.max(1, travelers - 1))} className="h-10 w-10 rounded-full border border-white/10 bg-white/5 text-lg">−</button><span className="w-8 text-center font-semibold">{travelers}</span><button onClick={() => setTravelers(Math.min(10, travelers + 1))} className="h-10 w-10 rounded-full border border-white/10 bg-white/5 text-lg">+</button></div></div>}

              {step === 2 && <div><p className="luxury-section-eyebrow">Step 02</p><h2 className="mt-3 text-3xl font-semibold">What should the journey hold?</h2><p className="mt-2 text-white/50">Choose up to four.</p><div className="mt-7 grid gap-3 sm:grid-cols-3">{interests.map((value) => <button key={value} onClick={() => toggleInterest(value)} className={`rounded-2xl border p-5 text-left font-semibold transition ${selectedInterests.includes(value) ? "border-[#d8b875]/55 bg-[#d8b875]/12" : "border-white/10 bg-white/[.03]"}`}><span className="text-lg">{selectedInterests.includes(value) ? "✦" : "○"}</span><span className="ml-3">{value}</span></button>)}</div></div>}

              {step === 3 && <div><p className="luxury-section-eyebrow">Step 03</p><h2 className="mt-3 text-3xl font-semibold">How should it move?</h2><div className="mt-7 grid gap-3 sm:grid-cols-3">{paces.map((value) => <button key={value} onClick={() => setPace(value)} className={`rounded-2xl border p-5 text-left transition ${pace === value ? "border-[#d8b875]/55 bg-[#d8b875]/12" : "border-white/10 bg-white/[.03]"}`}><span className="text-lg font-semibold">{value}</span><span className="mt-2 block text-sm text-white/50">{value === "Slow" ? "Longer pauses · fewer transfers" : value === "Fast" ? "More ground · tighter rhythm" : "Signature highlights · balanced pace"}</span></button>)}</div><h3 className="mt-8 text-sm font-bold uppercase tracking-[.16em] text-white/55">Travel style</h3><div className="mt-3 grid gap-3 sm:grid-cols-3">{budgets.map((value) => <button key={value} onClick={() => setBudget(value)} className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${budget === value ? "border-[#d8b875]/55 bg-[#d8b875]/12 text-[#f4efe6]" : "border-white/10 bg-white/[.03] text-white/60"}`}>{value}</button>)}</div></div>}

              {step === 4 && <div><p className="luxury-section-eyebrow">Step 04</p><h2 className="mt-3 text-3xl font-semibold">Where should the story begin?</h2><div className="mt-7 grid gap-3 sm:grid-cols-3">{starts.map((value) => <button key={value} onClick={() => setStartingPoint(value)} className={`rounded-2xl border p-5 text-left font-semibold transition ${startingPoint === value ? "border-[#d8b875]/55 bg-[#d8b875]/12" : "border-white/10 bg-white/[.03]"}`}>{value}</button>)}</div><div className="mt-8 rounded-2xl border border-[#d8b875]/18 bg-[#d8b875]/6 p-5"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#d8b875]">Ready</p><p className="mt-2 text-sm leading-6 text-white/65">We’ll score Sri Lankan destinations against your profile, connect the strongest route, and surface matching experiences.</p></div></div>}

              {error && <p className="mt-6 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">{error}</p>}
              <div className="mt-8 flex flex-wrap justify-between gap-3"><button disabled={step === 1 || loading} onClick={() => setStep((value) => Math.max(1, value - 1))} className="rounded-full border border-white/10 bg-white/[.03] px-5 py-3 text-sm font-semibold text-white/65 disabled:opacity-30">← Back</button>{step < 4 ? <button onClick={() => setStep((value) => Math.min(4, value + 1))} disabled={step === 2 && !selectedInterests.length} className="rounded-full bg-[#d8b875] px-6 py-3 text-sm font-bold text-[#09140f]">Continue →</button> : <button onClick={buildJourney} disabled={loading} className="rounded-full bg-[#d8b875] px-7 py-3.5 text-sm font-bold text-[#09140f]">{loading ? "Shaping your journey…" : "Reveal my journey ↗"}</button>}</div>
            </div>

            <aside className="space-y-3">
              {[['Days', `${days}`], ['Travellers', `${travelers}`], ['Interests', selectedInterests.join(" · ") || "Choose a few"], ['Pace', pace], ['Style', budget], ['Start', startingPoint]].map(([label, value]) => <div key={label} className="route-stat"><span>{label}</span><strong className="!text-base">{value}</strong></div>)}
            </aside>
          </div> : <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <div className="luxury-glass rounded-[26px] p-6 sm:p-8">
              <div className="flex items-start justify-between gap-5"><div><p className="luxury-section-eyebrow">{result?.aiPowered ? "AI concierge" : "Smart concierge"}</p><h2 className="mt-3 text-3xl font-semibold">Your journey is taking shape.</h2></div><span className="rounded-full border border-[#d8b875]/25 bg-[#d8b875]/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-[#d8b875]">{result?.profile.days} days</span></div>
              <p className="mt-6 text-base leading-8 text-white/68">{result?.narrative}</p>
              <div className="mt-7 flex flex-wrap gap-2">{result?.profile.interests.map((item) => <span key={item} className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2 text-xs text-white/60">{item}</span>)}</div>
              <div className="mt-8 flex flex-wrap gap-3"><button onClick={() => { setStep(1); setResult(null); }} className="rounded-full border border-white/10 bg-white/[.03] px-5 py-3 text-sm font-semibold">Re-shape journey</button><a href={`/plan?destination=${encodeURIComponent(result?.routeSlugs[0] ?? "")}`} className="rounded-full bg-[#d8b875] px-6 py-3 text-sm font-bold text-[#09140f]">Open Trip Builder ↗</a></div>
            </div>
            <div className="luxury-glass rounded-[26px] p-5 sm:p-6"><p className="luxury-section-eyebrow">Golden Trail</p><div data-golden-route className="golden-trail mt-6">{result?.route.map((place, index) => <a key={place.slug} href={`/destinations/${place.slug}`} className="golden-trail-stop group"><span className="golden-trail-marker">{index + 1}</span><div className="golden-trail-card"><img src={images[place.slug] ?? images.ella} alt={place.name}/><div className="golden-trail-copy"><p className="luxury-kicker">{place.region}</p><h3>{place.name}</h3><p>{place.summary}</p></div><span className="text-lg text-[#d8b875] transition group-hover:translate-x-1">↗</span></div></a>)}</div></div>
            <div className="luxury-glass rounded-[26px] p-6 sm:p-7 lg:col-span-2"><div className="flex items-end justify-between gap-4"><div><p className="luxury-section-eyebrow">Matched experiences</p><h2 className="mt-2 text-3xl font-semibold">Moments worth keeping.</h2></div><span className="text-xs text-white/40">Smart match · {result?.experiences.length ?? 0}</span></div><div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{result?.experiences.map((experience) => <a key={experience.slug} href={`/experiences/${experience.slug}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[.03] transition hover:-translate-y-1 hover:border-[#d8b875]/25"><div className="h-40 overflow-hidden"><img src={images[experience.destination_slug ?? "ella"] ?? images.ella} alt={experience.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/></div><div className="p-4"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#d8b875]">{experience.category ?? "Experience"}</p><h3 className="mt-2 text-lg font-semibold">{experience.name}</h3><p className="mt-2 text-sm leading-6 text-white/52">{experience.summary}</p></div></a>)}</div></div>
          </div>}
        </section>
      </div>
    </main>
  );
}
