"use client";

import { useMemo, useState } from "react";

type Destination = { id:string; name:string; region:string; summary:string; latitude:number; longitude:number; slug:string };
export default function InteractiveMap({destinations}:{destinations:Destination[]}){
 const [selected,setSelected]=useState<Destination|null>(null);
 const [route,setRoute]=useState<string[]>([]);
 const selectedStops=useMemo(()=>route.map(slug=>destinations.find(d=>d.slug===slug)).filter(Boolean) as Destination[],[route,destinations]);
 const mapSrc="https://www.openstreetmap.org/export/embed.html?bbox=79.5%2C5.8%2C82.2%2C9.9&layer=mapnik";
 function toggleRoute(d:Destination){setRoute(r=>r.includes(d.slug)?r.filter(x=>x!==d.slug):[...r,d.slug])}
 return <div className="relative h-[520px] w-full overflow-hidden bg-[#dce8df]">
  <iframe title="Sri Lanka destination map" src={mapSrc} className="absolute inset-0 h-full w-full border-0" loading="lazy"/>
  <div className="absolute inset-0 pointer-events-none">
   {destinations.map(d=>{const left=((d.longitude-79.5)/(82.2-79.5))*100;const top=(1-(d.latitude-5.8)/(9.9-5.8))*100;return <button key={d.id} onClick={()=>setSelected(d)} style={{left:`${left}%`,top:`${top}%`}} className="pointer-events-auto absolute -translate-x-1/2 -translate-y-full group" aria-label={`Open ${d.name}`}><span className="block h-5 w-5 rounded-full border-4 border-white bg-[#d9a441] shadow-lg transition group-hover:scale-125"/><span className="mt-1 hidden whitespace-nowrap rounded-full bg-[#10251f] px-2 py-1 text-[10px] font-bold text-white shadow-md group-hover:block">{d.name}</span></button>})}
  </div>
  <div className="absolute left-4 top-4 z-10 max-h-[455px] w-[235px] overflow-auto rounded-2xl border border-black/10 bg-white/95 p-3 shadow-xl backdrop-blur">
   <div className="flex items-center justify-between px-2 pb-2"><p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">Explore Sri Lanka</p>{route.length>0&&<button onClick={()=>setRoute([])} className="text-[10px] font-bold text-[#8d651d]">Clear route</button>}</div>
   <div className="space-y-1">{destinations.map((d,i)=><div key={d.id} className="rounded-xl hover:bg-[#f1eee6]"><button onClick={()=>setSelected(d)} className="w-full px-3 pt-2 text-left text-sm font-semibold text-[#183d32]">{i+1}. {d.name}</button><button onClick={()=>toggleRoute(d)} className={`px-3 pb-2 text-xs font-bold ${route.includes(d.slug)?"text-[#b27c1d]":"text-[#66756f]"}`}>{route.includes(d.slug)?"✓ In route":"+ Add to route"}</button></div>)}</div>
  </div>
  {selected&&<div className="absolute bottom-4 left-4 z-20 w-[min(370px,calc(100%-2rem))] rounded-2xl bg-[#10251f] p-5 text-white shadow-xl"><button onClick={()=>setSelected(null)} className="absolute right-3 top-2 text-white/60" aria-label="Close">×</button><p className="text-xs font-bold uppercase tracking-widest text-[#e7c36e]">{selected.region}</p><h3 className="mt-1 text-xl font-semibold">{selected.name}</h3><p className="mt-2 text-sm leading-6 text-white/70">{selected.summary}</p><div className="mt-4 flex gap-2"><button onClick={()=>toggleRoute(selected)} className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">{route.includes(selected.slug)?"Remove from route":"Add to route"}</button><a href={`/destinations/${selected.slug}`} className="rounded-full bg-[#e7c36e] px-4 py-2 text-sm font-bold text-[#10251f]">Explore →</a></div></div>}
  {route.length>0&&<div className="absolute bottom-4 right-4 z-20 hidden max-w-[300px] rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur sm:block"><p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">Your route</p><p className="mt-1 text-sm font-semibold text-[#183d32]">{selectedStops.map(d=>d.name).join(" → ")}</p><a href="/plan" className="mt-3 inline-block rounded-full bg-[#183d32] px-4 py-2 text-xs font-bold text-white">Build this trip →</a></div>}
 </div>;
}
