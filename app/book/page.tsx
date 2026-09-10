"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Experience = { id:string; slug:string; name:string; category:string|null; summary:string|null; description:string|null; destination_name:string|null; price_from:number|null; currency:string|null };

export default function BookPage(){
 const params=useSearchParams();
 const slug=params.get("experience")||"";
 const tripId=params.get("tripId")||"";
 const [experience,setExperience]=useState<Experience|null>(null);
 const [loading,setLoading]=useState(true);
 const [sending,setSending]=useState(false);
 const [done,setDone]=useState("");
 const [error,setError]=useState("");
 const [name,setName]=useState("");
 const [email,setEmail]=useState("");
 const [phone,setPhone]=useState("");
 const [date,setDate]=useState("");
 const [travelers,setTravelers]=useState(2);
 const [notes,setNotes]=useState("");

 useEffect(()=>{
  fetch("/api/experiences",{cache:"no-store"}).then(r=>r.json()).then(data=>{
   const row=(data.experiences||[]).find((x:Experience)=>x.slug===slug);
   if(row)setExperience(row); else setError("Experience not found.");
  }).catch(()=>setError("Could not load this experience.")).finally(()=>setLoading(false));
 },[slug]);

 async function submit(event:React.FormEvent){
  event.preventDefault();
  setSending(true);setError("");setDone("");
  try{
   const response=await fetch("/api/booking-requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({experienceId:experience?.id,tripId:tripId||null,guestName:name,guestEmail:email,guestPhone:phone,requestedDate:date||null,travelers,notes})});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||"Unable to submit request");
   setDone(`Request ${data.booking?.id?`#${String(data.booking.id).slice(0,8)}`:"submitted"}. We will keep it in your booking requests.`);
  }catch(err){setError(err instanceof Error?err.message:"Unable to submit request");}
  finally{setSending(false)}
 }

 return <main className="min-h-screen px-5 pb-24 pt-24 text-[#f4efe6] sm:px-8 md:pt-28"><div className="mx-auto max-w-5xl"><header className="mb-7 flex items-center justify-between"><a href="/" className="text-xl font-semibold">Discover<span className="text-[#d8b875]">Lanka</span></a><a href="/experiences" className="text-xs font-bold uppercase tracking-[.15em] text-white/55 hover:text-white">Back to experiences ↗</a></header>{loading?<div className="route-hero-panel p-12 text-center text-white/55">Loading your experience…</div>:error?<div className="route-hero-panel p-8 text-white/65">{error}</div>:experience&&<div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]"><section className="route-hero-panel p-7 sm:p-10"><p className="luxury-section-eyebrow">Booking request</p><h1 className="luxury-display-small mt-3 text-5xl md:text-7xl">{experience.name}</h1><p className="mt-5 leading-7 text-white/60">{experience.summary||experience.description||"A curated Sri Lankan experience."}</p><div className="mt-6 flex flex-wrap gap-2 text-xs text-white/45"><span className="rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5">{experience.category||"Experience"}</span><span className="rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5">{experience.destination_name||"Sri Lanka"}</span>{experience.price_from!=null&&<span className="rounded-full border border-[#d8b875]/20 bg-[#d8b875]/8 px-3 py-1.5 text-[#d8b875]">From {experience.currency||"LKR"} {Number(experience.price_from).toLocaleString("en-LK")}</span>}</div><div className="mt-8 rounded-2xl border border-[#d8b875]/15 bg-[#17362b]/45 p-4 text-sm leading-6 text-white/58"><strong className="text-white">How it works:</strong> this sends a booking request to DiscoverLanka. It is not an instant payment or confirmed reservation yet.</div></section><section className="luxury-step-card p-7 sm:p-10"><div><p className="luxury-section-eyebrow">Your details</p><h2 className="mt-2 font-serif text-4xl">Request this experience.</h2></div><form onSubmit={submit} className="mt-7 grid gap-4"><label className="grid gap-2 text-sm"><span className="text-white/55">Full name</span><input required value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" className="rounded-2xl border px-4 py-3.5"/></label><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm"><span className="text-white/55">Email</span><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="rounded-2xl border px-4 py-3.5"/></label><label className="grid gap-2 text-sm"><span className="text-white/55">Phone</span><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Optional" className="rounded-2xl border px-4 py-3.5"/></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm"><span className="text-white/55">Preferred date</span><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="rounded-2xl border px-4 py-3.5"/></label><label className="grid gap-2 text-sm"><span className="text-white/55">Travellers</span><input required min={1} max={50} type="number" value={travelers} onChange={e=>setTravelers(Math.max(1,Math.min(50,Number(e.target.value)||1)))} className="rounded-2xl border px-4 py-3.5"/></label></div><label className="grid gap-2 text-sm"><span className="text-white/55">Notes</span><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={5} placeholder="Tell us about preferences, timing or anything we should know." className="rounded-2xl border px-4 py-3.5"/></label>{error&&<p className="rounded-2xl border border-red-300/20 bg-red-300/5 p-4 text-sm text-red-100">{error}</p>}{done&&<p className="rounded-2xl border border-[#d8b875]/20 bg-[#d8b875]/8 p-4 text-sm text-[#ead39f]">{done}</p>}<button disabled={sending} className="mt-2 rounded-full bg-[#d8b875] px-6 py-3.5 text-sm font-extrabold text-[#09140f] disabled:cursor-wait disabled:opacity-60">{sending?"Sending request…":"Send booking request ↗"}</button><p className="text-xs leading-5 text-white/38">No payment is taken here. A confirmed booking can be added later when provider inventory is connected.</p></form></section></div>}</div></main>
}
