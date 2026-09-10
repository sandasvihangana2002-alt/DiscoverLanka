"use client";

import { useMemo, useState } from "react";

type Trip = {
  id:string;
  title:string;
  start_date:string|null;
  end_date:string|null;
  budget:number|null;
  currency:string;
  status:string;
  data:{days?:number;travelers?:number;interest?:string;budgetLevel?:string;selectedSlugs?:string[];itinerary?:unknown[];events?:unknown[]};
  updated_at:string;
};

type Props={trips:Trip[]};

function dateLabel(value:string|null){
  if(!value) return "Flexible dates";
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-LK",{dateStyle:"medium"});
}
function money(value:number|null,currency:string){
  if(value==null) return "Budget flexible";
  return `${currency||"LKR"} ${Math.round(value).toLocaleString("en-LK")}`;
}

export default function TripManager({trips:initialTrips}:Props){
  const [trips,setTrips]=useState(initialTrips);
  const [busy,setBusy]=useState<string|null>(null);
  const [message,setMessage]=useState("");
  const [editing,setEditing]=useState<string|null>(null);
  const [draftTitle,setDraftTitle]=useState("");

  const counts=useMemo(()=>({
    all:trips.length,
    planned:trips.filter(t=>t.status==="planned"||t.status==="draft").length,
    completed:trips.filter(t=>t.status==="completed").length,
  }),[trips]);

  async function updateTrip(trip:Trip,patch:Record<string,unknown>){
    setBusy(trip.id);setMessage("");
    try{
      const response=await fetch(`/api/trips?id=${encodeURIComponent(trip.id)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        title:patch.title??trip.title,
        days:trip.data.days,
        travelers:trip.data.travelers,
        interest:trip.data.interest,
        budgetLevel:trip.data.budgetLevel,
        budgetEstimate:trip.budget,
        selectedSlugs:trip.data.selectedSlugs,
        itinerary:trip.data.itinerary,
        events:trip.data.events,
        startDate:trip.start_date,
        endDate:trip.end_date,
        status:patch.status??trip.status,
      })});
      const payload=await response.json();
      if(!response.ok)throw new Error(payload.error||"Trip update failed");
      setTrips(current=>current.map(item=>item.id===trip.id?payload.trip:item));
      setEditing(null);setMessage("Trip updated.");
    }catch(error){setMessage(error instanceof Error?error.message:"Trip update failed.")}
    finally{setBusy(null)}
  }

  async function removeTrip(trip:Trip){
    if(!window.confirm(`Delete “${trip.title}”? This cannot be undone.`))return;
    setBusy(trip.id);setMessage("");
    try{
      const response=await fetch(`/api/trips?id=${encodeURIComponent(trip.id)}`,{method:"DELETE"});
      const payload=await response.json();
      if(!response.ok)throw new Error(payload.error||"Trip delete failed");
      setTrips(current=>current.filter(item=>item.id!==trip.id));
      setMessage("Trip deleted.");
    }catch(error){setMessage(error instanceof Error?error.message:"Trip delete failed.")}
    finally{setBusy(null)}
  }

  async function duplicateTrip(trip:Trip){
    setBusy(trip.id);setMessage("");
    try{
      const response=await fetch("/api/trips",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        title:`${trip.title} · Copy`,
        days:trip.data.days,
        travelers:trip.data.travelers,
        interest:trip.data.interest,
        budgetLevel:trip.data.budgetLevel,
        budgetEstimate:trip.budget,
        selectedSlugs:trip.data.selectedSlugs,
        itinerary:trip.data.itinerary,
        events:trip.data.events,
        startDate:trip.start_date,
        endDate:trip.end_date,
        status:"draft",
      })});
      const payload=await response.json();
      if(!response.ok)throw new Error(payload.error||"Trip duplication failed");
      setTrips(current=>[payload.trip,...current]);setMessage("Trip duplicated as a draft.");
    }catch(error){setMessage(error instanceof Error?error.message:"Trip duplication failed.")}
    finally{setBusy(null)}
  }

  return <div>
    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      {[['All journeys',counts.all],['Active / drafts',counts.planned],['Completed',counts.completed]].map(([label,value])=><div key={String(label)} className="rounded-2xl border border-white/8 bg-white/[.025] p-4"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#d8b875]">{label}</p><p className="mt-2 font-serif text-3xl">{value}</p></div>)}
    </div>
    {message&&<p className="mb-5 rounded-xl border border-[#d8b875]/15 bg-[#d8b875]/[.06] px-4 py-3 text-sm text-[#d8b875]">{message}</p>}
    <div className="grid gap-4">
      {trips.length?trips.map(trip=>{
        const isBusy=busy===trip.id;
        return <article key={trip.id} className="rounded-3xl border border-white/8 bg-white/[.025] p-5 transition duration-300 hover:border-[#d8b875]/20 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              {editing===trip.id?<div className="flex flex-col gap-3 sm:flex-row"><input autoFocus value={draftTitle} onChange={e=>setDraftTitle(e.target.value)} className="min-h-11 flex-1 rounded-full border border-white/12 bg-white/[.05] px-4 text-sm"/><button disabled={isBusy||!draftTitle.trim()} onClick={()=>updateTrip(trip,{title:draftTitle.trim()})} className="rounded-full bg-[#d8b875] px-5 py-3 text-xs font-bold text-[#09140f] disabled:opacity-50">Save name</button><button disabled={isBusy} onClick={()=>setEditing(null)} className="rounded-full border border-white/10 px-5 py-3 text-xs font-bold">Cancel</button></div>:<>
                <div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-serif text-2xl">{trip.title}</h3><span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-white/45">{trip.status}</span></div>
                <p className="mt-2 text-sm text-white/48">{dateLabel(trip.start_date)} → {dateLabel(trip.end_date)} · {trip.data.travelers||1} {(trip.data.travelers||1)===1?"traveller":"travellers"} · {trip.data.interest||"Curated"}</p>
                <p className="mt-1 text-xs text-white/35">{trip.data.days||7} days · {trip.data.budgetLevel||"Comfort"} · {money(trip.budget,trip.currency)}</p>
              </>}
            </div>
            <div className="flex flex-wrap gap-2 lg:max-w-[520px] lg:justify-end">
              <a href={`/my-trip?tripId=${encodeURIComponent(trip.id)}`} className="rounded-full bg-[#d8b875] px-4 py-2.5 text-xs font-bold text-[#09140f]">Open</a>
              <button disabled={isBusy} onClick={()=>{setEditing(trip.id);setDraftTitle(trip.title)}} className="rounded-full border border-white/10 px-4 py-2.5 text-xs font-semibold disabled:opacity-50">Rename</button>
              <button disabled={isBusy} onClick={()=>updateTrip(trip,{status:trip.status==="completed"?"planned":"completed"})} className="rounded-full border border-white/10 px-4 py-2.5 text-xs font-semibold disabled:opacity-50">{trip.status==="completed"?"Mark planned":"Mark complete"}</button>
              <button disabled={isBusy} onClick={()=>duplicateTrip(trip)} className="rounded-full border border-white/10 px-4 py-2.5 text-xs font-semibold disabled:opacity-50">Duplicate</button>
              <button disabled={isBusy} onClick={()=>removeTrip(trip)} className="rounded-full border border-red-300/15 bg-red-300/[.04] px-4 py-2.5 text-xs font-semibold text-red-100 disabled:opacity-50">Delete</button>
            </div>
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-[.14em] text-white/25">Updated {new Date(trip.updated_at).toLocaleDateString("en-LK")}</p>
        </article>;
      }):<div className="rounded-3xl border border-white/8 bg-white/[.025] p-8 text-center"><p className="luxury-section-eyebrow">Your cloud is ready</p><h3 className="mt-2 font-serif text-3xl">No saved journeys yet.</h3><p className="mx-auto mt-2 max-w-xl text-sm text-white/45">Build a journey in the concierge and it will appear here for editing, sharing and planning.</p><a href="/concierge" className="mt-6 inline-flex rounded-full bg-[#d8b875] px-6 py-3 text-sm font-bold text-[#09140f]">Create a journey ↗</a></div>}
    </div>
  </div>;
}
