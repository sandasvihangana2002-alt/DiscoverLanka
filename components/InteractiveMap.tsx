"use client";

import { useMemo, useState } from "react";

type Destination = { id:string; name:string; region:string; summary:string; latitude?:number; longitude?:number; slug:string };

export default function InteractiveMap({destinations}:{destinations:Destination[]}){
 const [selected,setSelected]=useState<Destination|null>(null);
 const [route,setRoute]=useState<string[]>([]);
 const selectedStops=useMemo(()=>route.map(slug=>destinations.find(d=>d.slug===slug)).filter(Boolean) as Destination[],[route,destinations]);
 const mapSrc="https://www.openstreetmap.org/export/embed.html?bbox=79.5%2C5.8%2C82.2%2C9.9&layer=mapnik";
 function toggleRoute(d:Destination){setRoute(r=>r.includes(d.slug)?r.filter(x=>x!==d.slug):[...r,d.slug])}
 return <div className="luxury-map relative h-[520px] w-full overflow-hidden bg-[#dce8df]">
  <iframe title="Sri Lanka destination map" src={mapSrc} className="absolute inset-0 h-full w-full border-0 grayscale-[.35] contrast-[1.04] saturate-[.72]" loading="lazy"/>
  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,transparent_18%,rgba(5,16,12,.16)_82%)]"/>
  <div className="absolute inset-0 pointer-events-none">
   {destinations.map(d=>{const latitude=d.latitude??7.8731;const longitude=d.longitude??80.7718;const left=((longitude-79.5)/(82.2-79.5))*100;const top=(1-(latitude-5.8)/(9.9-5.8))*100;return <button key={d.id} onClick={()=>setSelected(d)} style={{left:`${left}%`,top:`${top}%`}} className="luxury-map-marker pointer-events-auto absolute -translate-x-1/2 -translate-y-full group" aria-label={`Open ${d.name}`}><span className="block h-5 w-5 rounded-full border-4 border-white bg-[#d9a441] transition group-hover:scale-125"/><span className="mt-2 hidden whitespace-nowrap rounded-full border border-white/15 bg-[#07120f]/82 px-3 py-1.5 text-[10px] font-bold tracking-wide text-white shadow-xl backdrop-blur group-hover:block">{d.name}</span></button>})}
  </div>
  <div className="luxury-map-panel absolute left-4 top-4 z-10 max-h-[455px] w-[250px] overflow-auto rounded-[1.4rem] p-3 sm:left-5 sm:top-5">
   <div className="flex items-center justify-between gap-3 px-2 pb-3"><div><p className="luxury-kicker text-[#d8b875]">EXPLORE THE ISLAND</p><p className="mt-1 text-[11px] text-white/55">Choose a place or build a route.</p></div>{route.length>0&&<button onClick={()=>setRoute([])} className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-[#d8b875]">Clear</button>}</div>
   <div className="space-y-1">{destinations.map((d,i)=><div key={d.id} className="rounded-xl border border-transparent transition hover:border-white/8 hover:bg-white/5"><button onClick={()=>setSelected(d)} className="w-full px-3 pt-2 text-left text-sm font-semibold text-white/92">{String(i+1).padStart(2,"0")} · {d.name}</button><button onClick={()=>toggleRoute(d)} className={`px-3 pb-2 text-[11px] font-bold ${route.includes(d.slug)?"text-[#d8b875]":"text-white/48"}`}>{route.includes(d.slug)?"✓ In your route":"+ Add to route"}</button></div>)}</div>
  </div>
  {selected&&<div className="luxury-map-panel absolute bottom-4 left-4 z-20 w-[min(380px,calc(100%-2rem))] rounded-[1.5rem] p-5 sm:bottom-5 sm:left-5"><button onClick={()=>setSelected(null)} className="absolute right-4 top-3 text-white/55 transition hover:text-white" aria-label="Close">×</button><p className="luxury-kicker text-[#d8b875]">{selected.region}</p><h3 className="mt-1 luxury-serif text-2xl">{selected.name}</h3><p className="mt-2 text-sm leading-6 text-white/66">{selected.summary}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={()=>toggleRoute(selected)} className="rounded-full border border-white/14 bg-white/6 px-4 py-2 text-sm font-bold text-white">{route.includes(selected.slug)?"Remove from route":"Add to route"}</button><a href={`/destinations/${selected.slug}`} className="rounded-full bg-[#e7c36e] px-4 py-2 text-sm font-bold text-[#10251f]">Explore →</a></div></div>}
  {route.length>0&&<div className="luxury-map-panel absolute bottom-4 right-4 z-20 hidden max-w-[320px] rounded-[1.4rem] p-4 shadow-xl backdrop-blur sm:block"><p className="luxury-kicker text-[#d8b875]">GOLDEN TRAIL</p><p className="mt-1 text-sm font-semibold leading-6 text-white/90">{selectedStops.map(d=>d.name).join("  →  ")}</p><a href="/plan" className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#d8b875]">Build this journey <span>↗</span></a></div>}
 </div>;
}
