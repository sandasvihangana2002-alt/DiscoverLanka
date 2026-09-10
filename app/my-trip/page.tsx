"use client";

import { useEffect, useMemo, useState } from "react";

type Place = { id: string; slug: string; name: string; region: string; summary: string; image: string };
type TripData = { days: number; travelers: number; interest: string; budgetLevel: string; selectedSlugs: string[]; itinerary: unknown[] };
type Trip = { id: string; title: string; budget: number | null; currency: string; status: string; data: TripData };
type Day = { day: number; destination?: { name?: string; region?: string }; focus?: string; items?: Array<{ time?: string; title?: string }> };
type Itinerary = { id: string; title: string; summary: string | null; duration_days: number; budget_level: string; content: { days?: Day[] } };

const destinationImages: Record<string, string> = {
  kandy: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=88",
  ella: "https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=1200&q=88",
  galle: "https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=1200&q=88",
  sigiriya: "https://images.unsplash.com/photo-1588598198321-9735fd5246b8?auto=format&fit=crop&w=1200&q=88",
  yala: "https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=1200&q=88",
  mirissa: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1200&q=88",
  "nuwara-eliya": "https://images.unsplash.com/photo-1590123221594-8c5d2c5f3f44?auto=format&fit=crop&w=1200&q=88",
  anuradhapura: "https://images.unsplash.com/photo-1588258524675-c7f1e3e8d5d8?auto=format&fit=crop&w=1200&q=88",
};
const rates: Record<string, number> = { Budget: 9000, Comfort: 18000, Premium: 35000 };

export default function MyTripPage() {
  const [saved, setSaved] = useState<string[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const local = JSON.parse(localStorage.getItem("discoverlanka-saved") ?? "[]");
        const id = localStorage.getItem("discoverlanka-trip-id");
        const response = await fetch("/api/destinations");
        const data = response.ok ? await response.json() : { destinations: [] };
        const rows = Array.isArray(data.destinations) ? data.destinations : [];
        setPlaces(rows.map((item: Omit<Place, "image">) => ({ ...item, image: destinationImages[item.slug] ?? destinationImages.kandy })));

        if (id) {
          const [tripResponse, itineraryResponse] = await Promise.all([
            fetch(`/api/trips?id=${encodeURIComponent(id)}`),
            fetch(`/api/itineraries?tripId=${encodeURIComponent(id)}`),
          ]);
          if (tripResponse.ok) {
            const payload = await tripResponse.json();
            if (payload?.trip) {
              setTrip(payload.trip as Trip);
              const slugs = Array.isArray(payload.trip.data?.selectedSlugs) ? payload.trip.data.selectedSlugs : [];
              setSaved(slugs.length ? slugs : Array.isArray(local) ? local : []);
            }
          }
          if (itineraryResponse.ok) {
            const payload = await itineraryResponse.json();
            if (payload?.itinerary) setItinerary(payload.itinerary as Itinerary);
          }
        } else if (Array.isArray(local)) {
          setSaved(local.filter((value): value is string => typeof value === "string"));
        }
      } catch {
        setError("Could not load the live trip right now.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selected = useMemo(() => saved.map((slug) => places.find((place) => place.slug === slug)).filter(Boolean) as Place[], [saved, places]);
  const data = trip?.data;
  const days = data?.days ?? itinerary?.duration_days ?? 7;
  const travelers = data?.travelers ?? 2;
  const budget = data?.budgetLevel ?? itinerary?.budget_level ?? "Comfort";
  const interest = data?.interest ?? "Sri Lanka";
  const daily = rates[budget] ?? rates.Comfort;
  const estimate = trip?.budget ?? daily * days * travelers;
  const route = selected.map((place) => place.name).join(" → ");
  const coverage = Math.min(100, Math.round((selected.length / Math.max(1, days)) * 100));
  const money = (value: number) => `LKR ${Math.round(value).toLocaleString("en-LK")}`;

  async function share() {
    const text = trip ? `${trip.title} · ${route || "Sri Lanka"} · ${days} days · ${money(Number(estimate))}` : `My DiscoverLanka trip: ${route}`;
    try {
      if (navigator.share) await navigator.share({ title: "My DiscoverLanka Trip", text });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {}
  }

  function removeStop(slug: string) {
    const next = saved.filter((value) => value !== slug);
    setSaved(next);
    localStorage.setItem("discoverlanka-saved", JSON.stringify(next));
  }

  function clearLocal() {
    setSaved([]);
    setTrip(null);
    setItinerary(null);
    ["discoverlanka-saved", "discoverlanka-trip-id", "discoverlanka-itinerary", "discoverlanka-plan"].forEach((key) => localStorage.removeItem(key));
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#10251f]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f7f5ef]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
          <a href="/" className="text-xl font-bold tracking-tight">Discover<span className="text-[#d9a441]">Lanka</span></a>
          <div className="flex items-center gap-3 sm:gap-5">
            <a href="/plan" className="text-sm font-semibold text-[#66756f]">Plan trip</a>
            <a href="/" className="text-sm font-semibold text-[#66756f]">← Discover</a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-28 pt-14 sm:px-6 md:pt-20">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.24em] text-[#b27c1d]">Private travel dossier</p>
            <h1 className="mt-3 max-w-4xl text-5xl font-semibold tracking-[-.05em] md:text-7xl">Your Sri Lankan journey.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#66756f]">Saved places, live itinerary, budget and the next decision — gathered into one calm workspace.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={share} disabled={!selected.length && !trip} className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold disabled:opacity-40">{copied ? "Copied ✓" : "Share trip"}</button>
            <a href="/plan" className="rounded-full bg-[#183d32] px-6 py-3 text-sm font-bold text-white">Refine journey →</a>
          </div>
        </div>

        {loading ? <div className="luxury-step-card mt-12 p-12 text-center text-white/70">Loading your journey…</div> : error ? <div className="luxury-step-card mt-12 p-10 text-center">{error}</div> : !selected.length ? (
          <div className="luxury-step-card mt-12 p-10 text-center md:p-16">
            <div className="text-5xl text-[#d8b875]">✦</div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[.22em] text-[#d8b875]">Begin anywhere</p>
            <h2 className="mt-3 text-3xl font-semibold">Your trip is waiting for a first place.</h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-[#66756f]">Open the Trip Builder, choose your pace and interests, then save the journey here.</p>
            <a href="/plan" className="mt-7 inline-flex rounded-full bg-[#d9a441] px-7 py-3.5 font-bold text-[#10251f]">Build my trip →</a>
          </div>
        ) : (
          <>
            <section className="luxury-step-card mt-12 overflow-visible p-5 sm:p-7 md:p-9">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.22em] text-[#d8b875]">Golden Trail</p>
                  <h2 className="mt-2 text-3xl font-semibold">{trip?.title ?? "Your saved Sri Lanka route"}</h2>
                  <p className="mt-2 text-[#66756f]">{route || "Your selected places"}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[["Duration", `${days} days"`], ["Travellers", String(travelers)], ["Style", budget], ["Budget", money(Number(estimate))]].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/45">{label}</p><p className="mt-1 text-sm font-semibold text-white/90">{value}</p></div>)}
                </div>
              </div>

              <div data-golden-route className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {selected.map((place, index) => <a key={place.slug} href={`/destinations/${place.slug}`} className="golden-route-node group rounded-2xl border border-white/8 bg-black/12 p-3 pl-10 transition hover:border-[#d8b875]/35 hover:bg-white/6"><div className="flex items-center gap-3"><img src={place.image} alt={place.name} className="h-14 w-14 rounded-xl object-cover transition duration-700 group-hover:scale-[1.04]"/><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#d8b875]">Stop {index + 1}</p><p className="mt-1 font-semibold text-white/92">{place.name}</p><p className="mt-0.5 text-xs text-white/48">{place.region}</p></div></div></a>)}
              </div>
            </section>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[['Duration', `${days} days`], ['Travelers', String(travelers)], ['Style', budget], ['Interest', interest], ['Estimated total', money(Number(estimate))]].map(([label, value], index) => <div key={label} className={`luxury-step-card p-5 ${index===4?"!border-[#d8b875]/25 !bg-[#17362b]/70":""}`}><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#d8b875]">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></div>)}
            </div>

            <section className="luxury-step-card mt-6 p-7 sm:p-9">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#d8b875]">Journey intelligence</p><h2 className="mt-2 text-3xl font-semibold">A route with room to breathe.</h2></div><a href="/plan" className="text-sm font-bold text-[#d8b875]">Refine in the builder →</a></div>
              <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_300px]">
                <div className="rounded-2xl border border-white/8 bg-black/10 p-5"><div className="flex items-center justify-between text-xs font-bold uppercase tracking-[.16em]"><span>Plan coverage</span><span>{coverage}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-[#d8b875] transition-all duration-1000" style={{ width: `${coverage}%` }} /></div><p className="mt-4 text-sm leading-6 text-white/55">The saved route covers {selected.length} featured stop{selected.length===1?"":"s"}. Add more days or refine the route when you are ready.</p></div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1"><div className="rounded-2xl border border-white/8 bg-white/5 p-4"><p className="text-[10px] uppercase tracking-[.16em] text-white/45">Average / day</p><p className="mt-1 text-lg font-semibold">{money(Number(estimate) / Math.max(1, days))}</p></div><div className="rounded-2xl border border-white/8 bg-white/5 p-4"><p className="text-[10px] uppercase tracking-[.16em] text-white/45">Average / traveller / day</p><p className="mt-1 text-lg font-semibold">{money(Number(estimate) / Math.max(1, days * travelers))}</p></div></div>
              </div>
            </section>

            {itinerary?.content?.days?.length ? <section className="luxury-step-card mt-6 p-7 sm:p-9"><div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#d8b875]">Live itinerary</p><h2 className="mt-2 text-3xl font-semibold">{itinerary.title}</h2><p className="mt-2 text-sm text-white/55">{itinerary.summary}</p></div><span className="text-xs font-bold uppercase tracking-[.16em] text-white/45">{itinerary.duration_days} days · {itinerary.budget_level}</span></div><div className="mt-8 space-y-3">{itinerary.content.days.map((day) => <article key={day.day} className="luxury-route-row rounded-2xl border border-white/8 bg-black/10 p-5"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#d8b875]">Day {day.day}</p><h3 className="mt-1 text-xl font-semibold">{day.destination?.name ?? "Sri Lanka"}</h3></div><p className="text-sm text-white/50">{day.destination?.region ?? "Sri Lanka"} · {day.focus ?? "Travel"}</p></div><div className="mt-4 grid gap-2 md:grid-cols-3">{day.items?.map((item, index) => <div key={`${item.time ?? "plan"}-${index}`} className="rounded-xl border border-white/7 bg-white/4 p-3"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#d8b875]">{item.time ?? "Plan"}</p><p className="mt-1 text-sm font-semibold text-white/88">{item.title ?? "Explore locally"}</p></div>)}</div></article>)}</div></section> : null}

            <div className="mt-10 flex items-center justify-between border-b border-black/10 pb-5"><div><p className="font-semibold">{selected.length} {selected.length===1?"place":"places"} saved</p><p className="mt-1 text-sm text-[#66756f]">Keep the route focused, or continue shaping it in the builder.</p></div><button onClick={clearLocal} className="text-sm font-semibold text-[#8d651d]">Clear local trip</button></div>

            <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{selected.map((place,index)=><article key={place.slug} className="overflow-hidden rounded-3xl bg-white shadow-sm"><div className="relative h-56"><img src={place.image} alt={place.name} className="h-full w-full object-cover"/><span className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-xs font-bold text-white backdrop-blur">Stop {index+1}</span><button onClick={()=>removeStop(place.slug)} className="absolute right-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white backdrop-blur">Remove</button></div><div className="p-6"><p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">{place.region}</p><h2 className="mt-1 text-2xl font-semibold">{place.name}</h2><p className="mt-2 text-sm leading-6 text-[#66756f]">{place.summary}</p><div className="mt-5 flex items-center justify-between"><a href={`/destinations/${place.slug}`} className="text-sm font-bold text-[#183d32]">Explore →</a><a href={`/plan?destination=${encodeURIComponent(place.slug)}`} className="text-sm font-semibold text-[#8d651d]">Plan here</a></div></div></article>)}</div>

            <div className="luxury-step-card mt-10 p-8 text-white md:p-10"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#e7c36e]">Next move</p><h2 className="mt-2 text-3xl font-semibold">Make the route more yours.</h2><p className="mt-2 max-w-xl text-white/55">Change days, travelers, interests or budget in the Trip Builder. Your next generated plan becomes the new live itinerary.</p><a href="/plan" className="mt-6 inline-flex rounded-full bg-[#d9a441] px-7 py-3.5 font-bold text-[#10251f]">Refine my journey →</a></div>
          </>
        )}
      </section>
    </main>
  );
}
