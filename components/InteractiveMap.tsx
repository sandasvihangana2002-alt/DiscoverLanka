"use client";

import { useEffect, useState } from "react";

type Destination = { id: string; name: string; region: string; summary: string; latitude: number; longitude: number; slug: string };

export default function InteractiveMap({ destinations }: { destinations: Destination[] }) {
  const [selected, setSelected] = useState<Destination | null>(null);

  useEffect(() => {
    // Keep the map lightweight and dependency-free for Vercel builds.
  }, []);

  return (
    <div className="relative h-[430px] w-full overflow-hidden bg-[#dce8df]">
      <iframe
        title="Sri Lanka interactive map"
        src="https://www.openstreetmap.org/export/embed.html?bbox=79.6%2C5.8%2C82.1%2C9.9&layer=mapnik"
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
      />
      <div className="absolute left-4 top-4 z-10 max-h-[380px] w-[220px] overflow-auto rounded-2xl border border-black/10 bg-white/95 p-3 shadow-lg backdrop-blur">
        <p className="px-2 pb-2 text-xs font-bold uppercase tracking-widest text-[#8d651d]">Destinations</p>
        <div className="space-y-1">
          {destinations.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelected(d)}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#183d32] transition hover:bg-[#f1eee6]"
            >
              📍 {d.name}
            </button>
          ))}
        </div>
      </div>
      {selected && (
        <div className="absolute bottom-4 left-4 z-10 w-[min(360px,calc(100%-2rem))] rounded-2xl bg-[#10251f] p-5 text-white shadow-xl">
          <button onClick={() => setSelected(null)} className="absolute right-3 top-2 text-white/60">×</button>
          <p className="text-xs font-bold uppercase tracking-widest text-[#e7c36e]">{selected.region}</p>
          <h3 className="mt-1 text-xl font-semibold">{selected.name}</h3>
          <p className="mt-2 text-sm leading-6 text-white/70">{selected.summary}</p>
          <a href={`/destinations/${selected.slug}`} className="mt-3 inline-block text-sm font-bold text-[#e7c36e]">Explore destination →</a>
        </div>
      )}
    </div>
  );
}
