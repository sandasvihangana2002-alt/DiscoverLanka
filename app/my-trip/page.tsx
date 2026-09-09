"use client";

import { useEffect, useMemo, useState } from "react";

type Place = { id: string; slug: string; name: string; region: string; summary: string; image: string };
type TripData = { days: number; travelers: number; interest: string; budgetLevel: string; selectedSlugs: string[]; itinerary: unknown[] };
type Trip = { id: string; title: string; budget: number | null; currency: string; status: string; data: TripData };
type Itinerary = { id: string; title: string; summary: string | null; duration_days: number; budget_level: string; content: { days?: Array<{ day: number; destination?: { name?: string; region?: string }; focus?: string; items?: Array<{ time?: string; title?: string }> }> } };

const images: Record<string, string> = {
  kandy: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=80",
  ella: "https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=900&q=80",
  galle: "https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=900&q=80",
  sigiriya: "https://images.unsplash.com/photo-1588598198321-9735fd5246b8?auto=format&fit=crop&w=900&q=80",
  yala: "https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=900&q=80",
  mirissa: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=900&q=80",
  "nuwara-eliya": "https://images.unsplash.com/photo-1590123221594-8c5d2c5f3f44?auto=format&fit=crop&w=900&q=80",
  anuradhapura: "https://images.unsplash.com/photo-1588258524675-c7f1e3e8d5d8?auto=format&fit=crop&w=900&q=80",
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
        const localRaw = localStorage.getItem("discoverlanka-saved") ?? "[]";
        const local = JSON.parse(localRaw);
        const id = localStorage.getItem("discoverlanka-trip-id");

        const destinationsResponse = await fetch("/api/destinations");
        const destinationsData = destinationsResponse.ok ? await destinationsResponse.json() : { destinations: [] };
        const rows = Array.isArray(destinationsData.destinations) ? destinationsData.destinations : [];
        setPlaces(rows.map((item: Omit<Place, "image">) => ({ ...item, image: images[item.slug] ?? images.kandy })));

        if (id) {
          const tripResponse = await fetch(`/api/trips?id=${encodeURIComponent(id)}`);
          if (tripResponse.ok) {
            const tripData = await tripResponse.json();
            if (tripData?.trip) {
              setTrip(tripData.trip as Trip);
              const selectedSlugs = Array.isArray(tripData.trip.data?.selectedSlugs) ? tripData.trip.data.selectedSlugs : [];
              setSaved(selectedSlugs.length ? selectedSlugs : Array.isArray(local) ? local : []);
            }
          }

          const itineraryResponse = await fetch(`/api/itineraries?tripId=${encodeURIComponent(id)}`);
          if (itineraryResponse.ok) {
            const itineraryData = await itineraryResponse.json();
            if (itineraryData?.itinerary) setItinerary(itineraryData.itinerary as Itinerary);
          }
        } else if (Array.isArray(local)) {
          setSaved(local.filter((value): value is string => typeof value === "string"));
        }
      } catch (err) {
        console.error("My Trip load error", err);
        setError("Could not load the live trip right now.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selected = useMemo(
    () => saved.map((slug) => places.find((place) => place.slug === slug)).filter(Boolean) as Place[],
    [saved, places]
  );

  const data = trip?.data;
  const days = data?.days ?? 7;
  const travelers = data?.travelers ?? 2;
  const budget = data?.budgetLevel ?? "Comfort";
  const estimate = trip?.budget ?? (() => {
    const daily = rates[budget] ?? rates.Comfort;
    const factor = Math.max(1, saved.length * 0.9);
    return daily * 0.42 * days * travelers + daily * 0.23 * days * travelers + daily * 0.18 * days * factor + daily * 0.17 * days * factor;
  })();

  const money = (value: number) => `LKR ${Math.round(value).toLocaleString("en-LK")}`;

  async function share() {
    const text = trip ? `My DiscoverLanka trip: ${trip.title}` : `My DiscoverLanka trip: ${selected.map((place) => place.name).join(" → ")}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My DiscoverLanka Trip", text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {}
  }

  function clearLocal() {
    setSaved([]);
    setTrip(null);
    setItinerary(null);
    localStorage.removeItem("discoverlanka-saved");
    localStorage.removeItem("discoverlanka-trip-id");
    localStorage.removeItem("discoverlanka-itinerary");
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#10251f]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f7f5ef]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="text-xl font-bold">Discover<span className="text-[#d9a441]">Lanka</span></a>
          <div className="flex items-center gap-4">
            <a href="/plan" className="text-sm font-semibold text-[#66756f]">Plan trip</a>
            <a href="/" className="text-sm font-semibold text-[#66756f]">← Discover</a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-16 md:pt-24">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.2em] text-[#b27c1d]">My Trip</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-[-.04em] md:text-7xl">Your Sri Lankan journey.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#66756f]">Your saved route and generated itinerary, loaded from the live DiscoverLanka backend.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={share} disabled={!selected.length && !trip} className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold disabled:opacity-40">{copied ? "Copied ✓" : "Share trip"}</button>
            <a href="/plan" className="rounded-full bg-[#183d32] px-6 py-3 text-sm font-bold text-white">Edit trip →</a>
          </div>
        </div>

        {loading ? (
          <div className="mt-14 rounded-[2rem] bg-white p-12 text-center text-[#66756f]">Loading your live trip…</div>
        ) : error ? (
          <div className="mt-14 rounded-[2rem] bg-[#e9e2d3] p-10 text-center">{error}</div>
        ) : !selected.length ? (
          <div className="mt-14 rounded-[2rem] bg-[#e9e2d3] p-10 text-center md:p-16">
            <div className="text-5xl">♡</div>
            <h2 className="mt-5 text-3xl font-semibold">Your trip is waiting for a first place.</h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-[#66756f]">Generate a trip in the Trip Builder and it will be saved to the live backend.</p>
            <a href="/plan" className="mt-7 inline-block rounded-full bg-[#d9a441] px-7 py-3.5 font-bold">Build my trip →</a>
          </div>
        ) : (
          <>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl bg-white p-6"><p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">Duration</p><p className="mt-2 text-2xl font-semibold">{days} days</p></div>
              <div className="rounded-3xl bg-white p-6"><p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">Travelers</p><p className="mt-2 text-2xl font-semibold">{travelers}</p></div>
              <div className="rounded-3xl bg-white p-6"><p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">Style</p><p className="mt-2 text-2xl font-semibold">{budget}</p></div>
              <div className="rounded-3xl bg-[#183d32] p-6 text-white"><p className="text-xs font-bold uppercase tracking-widest text-[#e7c36e]">Estimated total</p><p className="mt-2 text-2xl font-semibold">{money(Number(estimate))}</p></div>
            </div>

            {itinerary?.content?.days && itinerary.content.days.length > 0 && (
              <section className="mt-10 rounded-[2rem] bg-white p-7 shadow-sm md:p-10">
                <p className="text-sm font-bold uppercase tracking-widest text-[#8d651d]">Live itinerary</p>
                <h2 className="mt-2 text-3xl font-semibold">{itinerary.title}</h2>
                <p className="mt-2 text-sm text-[#66756f]">{itinerary.summary}</p>
                <div className="mt-7 space-y-3">
                  {itinerary.content.days.map((day) => (
                    <article key={day.day} className="rounded-2xl bg-[#f7f5ef] p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">Day {day.day}</p>
                      <h3 className="mt-1 text-xl font-semibold">{day.destination?.name ?? "Sri Lanka"}</h3>
                      <p className="mt-1 text-sm text-[#66756f]">{day.destination?.region ?? "Sri Lanka"} · {day.focus ?? "Travel"}</p>
                      <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        {day.items?.map((item, index) => <div key={`${item.time ?? "time"}-${index}`} className="rounded-xl bg-white p-3"><p className="text-xs font-bold text-[#b27c1d]">{item.time ?? "Plan"}</p><p className="mt-1 text-sm font-semibold">{item.title ?? "Explore locally"}</p></div>)}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-12 flex items-center justify-between border-b border-black/10 pb-5">
              <div><p className="font-semibold">{selected.length} {selected.length === 1 ? "place" : "places"} saved</p><p className="mt-1 text-sm text-[#66756f]">Route data is coming from the live trip record.</p></div>
              <button onClick={clearLocal} className="text-sm font-semibold text-[#8d651d]">Clear local trip</button>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {selected.map((place, index) => (
                <article key={place.slug} className="overflow-hidden rounded-3xl bg-white shadow-sm">
                  <div className="relative h-56"><img src={place.image} alt={place.name} className="h-full w-full object-cover"/><span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold">Stop {index + 1}</span></div>
                  <div className="p-6"><p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">{place.region}</p><h2 className="mt-1 text-2xl font-semibold">{place.name}</h2><p className="mt-2 text-sm leading-6 text-[#66756f]">{place.summary}</p><a href={`/destinations/${place.slug}`} className="mt-5 inline-block text-sm font-bold text-[#183d32]">Explore {place.name} →</a></div>
                </article>
              ))}
            </div>

            <div className="mt-10 rounded-[2rem] bg-[#10251f] p-8 text-white md:p-10">
              <p className="text-sm font-bold uppercase tracking-widest text-[#e7c36e]">Live trip</p>
              <h2 className="mt-2 text-3xl font-semibold">{trip ? "This journey is synced to Neon." : "Build your live journey."}</h2>
              <p className="mt-2 max-w-xl text-white/60">Use the Trip Builder to update the route and generate a new live itinerary.</p>
              <a href="/plan" className="mt-6 inline-block rounded-full bg-[#d9a441] px-7 py-3.5 font-bold text-[#10251f]">Build my trip →</a>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
