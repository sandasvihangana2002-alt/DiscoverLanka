"use client";

import { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth/client";

type Place = { id: string; slug: string; name: string; region: string; summary: string; image: string };
type DayItem = { time: string; title: string; detail?: string };
type Day = { day: number; destination?: { slug?: string; name?: string; region?: string }; focus?: string; transfer_minutes?: number; items?: DayItem[] };
type TripData = { days: number; travelers: number; interest: string; budgetLevel: string; selectedSlugs: string[]; itinerary: Day[] };
type Trip = { id: string; title: string; budget: number | null; currency: string; status: string; data: TripData };
type Itinerary = { id: string; title: string; summary: string | null; duration_days: number; budget_level: string; content: { days?: Day[] } };

const images: Record<string, string> = {
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
  const { data: session, isPending: authPending } = authClient.useSession();
  const [saved, setSaved] = useState<string[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [cloudTrips, setCloudTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const local = JSON.parse(localStorage.getItem("discoverlanka-saved") ?? "[]");
        const id = localStorage.getItem("discoverlanka-trip-id");
        const destinationResponse = await fetch("/api/destinations");
        const destinationData = destinationResponse.ok ? await destinationResponse.json() : { destinations: [] };
        const rows = Array.isArray(destinationData.destinations) ? destinationData.destinations : [];
        setPlaces(rows.map((x: Omit<Place, "image">) => ({ ...x, image: images[x.slug] ?? images.ella })));
        if (id) {
          const [tripResponse, itineraryResponse] = await Promise.all([fetch(`/api/trips?id=${encodeURIComponent(id)}`), fetch(`/api/itineraries?tripId=${encodeURIComponent(id)}`)]);
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
        } else if (Array.isArray(local)) setSaved(local.filter((value): value is string => typeof value === "string"));
      } catch { setError("Could not load the live trip right now."); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/me/trips").then((r) => r.ok ? r.json() : { trips: [] }).then((data) => setCloudTrips(Array.isArray(data.trips) ? data.trips : [])).catch(() => {});
  }, [session?.user]);

  const selected = useMemo(() => saved.map((slug) => places.find((place) => place.slug === slug)).filter(Boolean) as Place[], [saved, places]);
  const data = trip?.data;
  const days = data?.days ?? itinerary?.duration_days ?? 7;
  const travelers = data?.travelers ?? 2;
  const budget = data?.budgetLevel ?? itinerary?.budget_level ?? "Comfort";
  const interest = data?.interest ?? "Sri Lanka";
  const estimate = trip?.budget ?? (rates[budget] ?? rates.Comfort) * days * travelers;
  const route = selected.map((place) => place.name).join(" → ");
  const coverage = Math.min(100, Math.round((selected.length / Math.max(1, days)) * 100));
  const money = (value: number) => `LKR ${Math.round(value).toLocaleString("en-LK")}`;
  const cloudSynced = Boolean(session?.user && trip?.data);

  async function share() {
    const text = trip ? `${trip.title} · ${route || "Sri Lanka"} · ${days} days · ${money(Number(estimate))}` : `My DiscoverLanka trip: ${route}`;
    try { if (navigator.share) await navigator.share({ title: "My DiscoverLanka Trip", text }); else { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); } } catch {}
  }

  async function syncToCloud() {
    if (!session?.user || !trip) return;
    setSyncing(true); setError("");
    try {
      const response = await fetch("/api/trips", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: trip.title, days, travelers, interest, budgetLevel: budget, budgetEstimate: Number(estimate), selectedSlugs: saved, itinerary: data?.itinerary ?? itinerary?.content?.days ?? [] }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not sync trip");
      if (payload?.trip?.id) { localStorage.setItem("discoverlanka-trip-id", payload.trip.id); setTrip(payload.trip as Trip); setCloudTrips((current) => [payload.trip as Trip, ...current]); }
    } catch (e) { setError(e instanceof Error ? e.message : "Could not sync trip"); }
    finally { setSyncing(false); }
  }

  function removeStop(slug: string) { const next = saved.filter((value) => value !== slug); setSaved(next); localStorage.setItem("discoverlanka-saved", JSON.stringify(next)); }
  function clearLocal() { setSaved([]); setTrip(null); setItinerary(null); ["discoverlanka-saved", "discoverlanka-trip-id", "discoverlanka-itinerary", "discoverlanka-plan"].forEach((key) => localStorage.removeItem(key)); }

  return (
    <main className="min-h-screen bg-[#07120f] text-[#f4efe6]">
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5"><div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-black/25 px-5 py-4 backdrop-blur-xl"><a href="/" className="text-xl font-semibold">Discover<span className="text-[#d8b875]">Lanka</span></a><div className="flex items-center gap-3 sm:gap-4"><a href="/concierge" className="text-sm font-semibold text-white/65">Concierge</a><a href={session?.user ? "/account" : "/auth/sign-in"} className="text-sm font-semibold text-white/65">{authPending ? "Account" : session?.user ? session.user.name || "Account" : "Sign in"}</a></div></div></header>
      {loading ? <div className="mx-auto max-w-3xl px-5 py-32 text-center text-white/55">Loading your journey…</div> : <section className="mx-auto max-w-7xl px-5 pb-28 pt-20 sm:px-8 md:pt-28">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><p className="luxury-section-eyebrow">Private travel dossier</p><h1 className="luxury-display-small mt-4 max-w-5xl text-6xl md:text-8xl">{trip?.title ?? "Your Sri Lankan journey."}</h1><p className="mt-5 max-w-2xl text-base leading-8 text-white/60 md:text-lg">A calm workspace for the places you kept, the route you built, and the next decision.</p></div><div className="flex flex-wrap gap-3"><button onClick={share} disabled={!selected.length && !trip} className="rounded-full border border-white/12 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-[.15em] text-white/70 disabled:opacity-40">{copied ? "Copied ✓" : "Share journey"}</button>{session?.user && cloudSynced && <span className="rounded-full border border-[#d8b875]/20 bg-[#d8b875]/7 px-4 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#d8b875]">Cloud synced</span>}{session?.user && trip && !cloudSynced && <button onClick={syncToCloud} disabled={syncing} className="rounded-full border border-[#d8b875]/35 bg-[#d8b875]/8 px-5 py-3 text-xs font-bold uppercase tracking-[.15em] text-[#d8b875]">{syncing ? "Syncing…" : "Save to cloud"}</button>}<a href="/concierge" className="premium-button premium-button-gold rounded-full px-5 py-3 text-xs font-extrabold uppercase tracking-[.15em]">Refine journey ↗</a></div></div>
        {error && <div className="route-hero-panel mt-10 p-6 text-white/70">{error}</div>}
        {!selected.length ? <div className="route-hero-panel mt-12 p-10 text-center md:p-16"><span className="text-5xl text-[#d8b875]">✦</span><p className="mt-6 luxury-section-eyebrow">Begin anywhere</p><h2 className="mt-3 font-serif text-4xl">Your journey is waiting.</h2><p className="mx-auto mt-4 max-w-xl leading-7 text-white/55">Use the concierge to shape a route, then your private dossier will keep the journey close.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><a href="/concierge" className="premium-button premium-button-gold rounded-full px-7 py-3.5 text-xs font-extrabold uppercase tracking-[.16em]">Open Concierge ↗</a><a href="/plan" className="rounded-full border border-white/12 bg-white/5 px-7 py-3.5 text-xs font-bold uppercase tracking-[.16em]">Open Trip Builder</a></div></div> : <>
          <section className="luxury-step-card mt-12 p-5 sm:p-7 md:p-9"><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="luxury-section-eyebrow">Golden Trail</p><h2 className="mt-2 font-serif text-4xl">{route}</h2><p className="mt-2 text-sm text-white/50">{selected.length} stop{selected.length === 1 ? "" : "s"} · {days} days · {travelers} traveller{travelers === 1 ? "" : "s"}</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Style",budget],["Interest",interest],["Budget",money(Number(estimate))],["Sync",cloudSynced ? "Cloud" : "Browser"]].map(([k,v])=><div key={k} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/40">{k}</p><p className="mt-1 truncate text-sm font-semibold text-white/90">{v}</p></div>)}</div></div><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-golden-route>{selected.map((place,index)=><a key={place.slug} href={`/destinations/${place.slug}`} className="golden-route-node group rounded-2xl border border-white/8 bg-black/12 p-3 pl-10 transition hover:border-[#d8b875]/35"><div className="flex items-center gap-3"><img src={place.image} alt={place.name} className="h-14 w-14 rounded-xl object-cover transition duration-700 group-hover:scale-105"/><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#d8b875]">Stop {index+1}</p><p className="mt-1 truncate font-semibold text-white/90">{place.name}</p><p className="text-xs text-white/45">{place.region}</p></div></div></a>)}</div></section>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[["Duration",`${days} days`],["Travelers",String(travelers)],["Style",budget],["Interest",interest],["Estimated total",money(Number(estimate))]].map(([k,v],i)=><div key={k} className={`luxury-step-card p-5 ${i===4?"!border-[#d8b875]/25 !bg-[#16382f]/55":""}`}><p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#d8b875]">{k}</p><p className="mt-2 text-xl font-semibold">{v}</p></div>)}</div>
          <section className="luxury-step-card mt-6 p-7 sm:p-9"><div className="flex items-end justify-between gap-5"><div><p className="luxury-section-eyebrow">Journey intelligence</p><h2 className="mt-2 font-serif text-4xl">A route with room to breathe.</h2></div><a href="/concierge" className="hidden text-xs font-bold uppercase tracking-[.16em] text-white/50 hover:text-white sm:block">Re-shape with Concierge ↗</a></div><div className="mt-7 grid gap-4 lg:grid-cols-[1fr_310px]"><div className="rounded-2xl border border-white/8 bg-black/10 p-5"><div className="flex items-center justify-between text-xs font-bold uppercase tracking-[.16em]"><span className="text-white/55">Plan coverage</span><span className="text-[#d8b875]">{coverage}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/7"><div className="h-full rounded-full bg-[#d8b875] transition-all duration-1000" style={{width:`${coverage}%`}}/></div><p className="mt-4 text-sm leading-6 text-white/48">The journey keeps its rhythm by spacing major days and leaving open evenings instead of filling every hour.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1"><div className="rounded-2xl border border-white/8 bg-white/4 p-4"><p className="text-[10px] uppercase tracking-[.16em] text-white/40">Average / day</p><p className="mt-1 text-lg font-semibold">{money(Number(estimate)/Math.max(1,days))}</p></div><div className="rounded-2xl border border-white/8 bg-white/4 p-4"><p className="text-[10px] uppercase tracking-[.16em] text-white/40">Per traveller / day</p><p className="mt-1 text-lg font-semibold">{money(Number(estimate)/Math.max(1,days*travelers))}</p></div></div></div></section>
          {itinerary?.content?.days?.length ? <section className="luxury-step-card mt-6 p-7 sm:p-9"><p className="luxury-section-eyebrow">Live itinerary</p><h2 className="mt-2 font-serif text-4xl">{itinerary.title}</h2><p className="mt-2 text-sm text-white/50">{itinerary.summary}</p><div className="mt-8 space-y-3">{itinerary.content.days.map((day)=><article key={day.day} className="luxury-route-row rounded-2xl border border-white/8 bg-black/10 p-5"><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#d8b875]">Day {day.day}</p><h3 className="mt-1 font-serif text-2xl">{day.destination?.name ?? "Sri Lanka"}</h3><p className="mt-1 text-xs uppercase tracking-[.14em] text-white/35">{day.destination?.region ?? "Sri Lanka"}</p></div><div className="text-right text-xs text-white/45">{day.transfer_minutes && day.transfer_minutes > 0 ? `Transfer ≈ ${day.transfer_minutes} min` : "Arrival / base day"}<p className="mt-2 max-w-xs text-sm font-semibold text-[#d8b875]">{day.focus ?? interest}</p></div></div><div className="mt-4 grid gap-2 md:grid-cols-3">{day.items?.map((item,index)=><div key={`${item.time}-${index}`} className="rounded-xl border border-white/7 bg-white/4 p-3"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#d8b875]">{item.time}</p><p className="mt-1 text-sm font-semibold text-white/78">{item.title}</p>{item.detail && <p className="mt-2 text-xs leading-5 text-white/45">{item.detail}</p>}</div>)}</div></article>)}</div></section> : null}
          <section className="mt-8"><div className="flex items-end justify-between gap-4 border-b border-white/8 pb-4"><div><p className="luxury-section-eyebrow">Saved places</p><h2 className="mt-2 font-serif text-4xl">The places you kept.</h2></div><button onClick={clearLocal} className="text-xs font-bold uppercase tracking-[.16em] text-white/40 hover:text-white">Clear local</button></div><div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{selected.map((place,index)=><article key={place.slug} className="luxury-feature-shell group overflow-hidden rounded-[1.8rem]"><div className="relative h-56 overflow-hidden"><img src={place.image} alt={place.name} className="h-full w-full object-cover transition duration-[1100ms] group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#06100d]/80 to-transparent"/><span className="absolute left-4 top-4 rounded-full border border-white/14 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[.17em]">Stop {index+1}</span></div><div className="p-6"><p className="luxury-section-eyebrow">{place.region}</p><h3 className="mt-2 font-serif text-3xl">{place.name}</h3><p className="mt-3 text-sm leading-6 text-white/52">{place.summary}</p><div className="mt-5 flex items-center justify-between"><a href={`/destinations/${place.slug}`} className="text-xs font-bold uppercase tracking-[.15em] text-white/70">Explore ↗</a><button onClick={()=>removeStop(place.slug)} className="text-xs font-bold uppercase tracking-[.15em] text-white/40 hover:text-white">Remove</button></div></div></article>)}</div></section>
          {session?.user && cloudTrips.length > 1 && <section className="mt-12"><p className="luxury-section-eyebrow">Cloud journeys</p><h2 className="mt-2 font-serif text-4xl">Your recent journeys.</h2><div className="mt-6 grid gap-3 md:grid-cols-2">{cloudTrips.slice(0,4).map((cloud,index)=><a key={`${cloud.id}-${index}`} href={`/my-trip?trip=${cloud.id}`} className="luxury-step-card block p-5 transition hover:-translate-y-1"><p className="text-xs font-bold text-[#d8b875]">{cloud.data?.days ?? 0} DAYS · {cloud.data?.budgetLevel ?? "Comfort"}</p><h3 className="mt-2 font-serif text-2xl">{cloud.title}</h3><p className="mt-1 text-sm text-white/45">{Array.isArray(cloud.data?.selectedSlugs) ? cloud.data.selectedSlugs.join(" → ") : "Cloud saved"}</p></a>)}</div></section>}
        </>}
      </section>}
    </main>
  );
}
