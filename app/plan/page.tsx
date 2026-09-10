"use client";

import { useEffect, useMemo, useState } from "react";

type Destination = { id:string; slug:string; name:string; region:string; summary:string; image:string; latitude:number; longitude:number };
type Season = { id:string; name:string; starts_month:number; ends_month:number; notes:string|null };
type ItineraryItem = { time:string; title:string; detail:string };
type ItineraryDay = { day:number; destination:Destination; focus:string; items:ItineraryItem[] };

const destinationImages:Record<string,string>={
  kandy:"https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1100&q=88",
  ella:"https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=1100&q=88",
  galle:"https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=1100&q=88",
  sigiriya:"https://images.unsplash.com/photo-1588598198321-9735fd5246b8?auto=format&fit=crop&w=1100&q=88",
  yala:"https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=1100&q=88",
  mirissa:"https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1100&q=88",
  "nuwara-eliya":"https://images.unsplash.com/photo-1590123221594-8c5d2c5f3f44?auto=format&fit=crop&w=1100&q=88",
  anuradhapura:"https://images.unsplash.com/photo-1588258524675-c7f1e3e8d5d8?auto=format&fit=crop&w=1100&q=88",
};
const interests=["Mountains","Coast","Wildlife","Culture","Food","Slow travel"];
const budgets=["Budget","Comfort","Premium"];
const daysOptions=[3,5,7,10,14];
const dailyRates:Record<string,number>={Budget:9000,Comfort:18000,Premium:35000};
const fallbackSeasons:Season[]=[
  {id:"fallback-1",name:"Northeast Monsoon",starts_month:12,ends_month:2,notes:"Use the south and west coast as your first choice for beach-focused days."},
  {id:"fallback-2",name:"First Inter-Monsoon",starts_month:3,ends_month:4,notes:"Expect warm transition weather and plan flexible afternoons for showers."},
  {id:"fallback-3",name:"Southwest Monsoon",starts_month:5,ends_month:9,notes:"Shift outdoor and beach plans toward the east and north when practical."},
  {id:"fallback-4",name:"Second Inter-Monsoon",starts_month:10,ends_month:11,notes:"Keep room for weather changes and enjoy the greener inland landscape."},
];
const templates:Record<string,ItineraryItem[]>={
  Mountains:[{time:"Morning",title:"Start with the hills",detail:"A gentle walk, viewpoint or tea-country morning."},{time:"Afternoon",title:"Follow the landscape",detail:"Choose one scenic trail or local stop without rushing."},{time:"Evening",title:"Slow down locally",detail:"Dinner, sunset and an easy evening."}],
  Coast:[{time:"Morning",title:"Beach & sea air",detail:"A quiet coastal walk and a relaxed start."},{time:"Afternoon",title:"Coastal exploring",detail:"Discover a historic quarter or local experience."},{time:"Evening",title:"Sunset by the sea",detail:"Stay out for golden hour and a memorable meal."}],
  Wildlife:[{time:"Morning",title:"Nature first",detail:"Early wildlife, birding or a guided nature experience."},{time:"Afternoon",title:"Open landscape",detail:"Keep the pace loose around the surrounding nature."},{time:"Evening",title:"Rest & reset",detail:"Return early and let the day settle."}],
  Culture:[{time:"Morning",title:"Heritage morning",detail:"Visit a major cultural site while it is cooler and quieter."},{time:"Afternoon",title:"Local stories",detail:"Explore a historic area, craft tradition or museum."},{time:"Evening",title:"Taste the place",detail:"Try a local dinner and take a relaxed evening walk."}],
  Food:[{time:"Morning",title:"Local breakfast",detail:"Start with a Sri Lankan breakfast and a gentle walk."},{time:"Afternoon",title:"Food discovery",detail:"Make time for a market, cooking experience or regional specialty."},{time:"Evening",title:"Dinner with a view",detail:"Finish with a memorable local meal."}],
  "Slow travel":[{time:"Morning",title:"Unhurried start",detail:"Sleep in, enjoy breakfast and move slowly through the area."},{time:"Afternoon",title:"One meaningful experience",detail:"Choose one local experience and leave space around it."},{time:"Evening",title:"Golden-hour pause",detail:"Watch the light change and keep the evening flexible."}],
};
const routeOrder:Record<string,string[]>={Mountains:["ella","kandy","nuwara-eliya","sigiriya"],Coast:["galle","mirissa","ella","kandy"],Wildlife:["yala","ella","kandy","mirissa"],Culture:["sigiriya","kandy","anuradhapura","galle"],Food:["kandy","galle","mirissa","ella"],"Slow travel":["ella","nuwara-eliya","galle","mirissa"]};

function seasonForMonth(month:number,seasons:Season[]){return seasons.find((s)=>s.starts_month<=s.ends_month?month>=s.starts_month&&month<=s.ends_month:month>=s.starts_month||month<=s.ends_month)||seasons[0];}

export default function PlanPage(){
  const [destinations,setDestinations]=useState<Destination[]>([]);
  const [seasons,setSeasons]=useState<Season[]>(fallbackSeasons);
  const [loading,setLoading]=useState(true);
  const [step,setStep]=useState(1);
  const [days,setDays]=useState(7);
  const [travelers,setTravelers]=useState(2);
  const [interest,setInterest]=useState("Mountains");
  const [budget,setBudget]=useState("Comfort");
  const [selected,setSelected]=useState<string[]>([]);
  const [itinerary,setItinerary]=useState<ItineraryDay[]>([]);
  const [generated,setGenerated]=useState(false);
  const [tripId,setTripId]=useState<string|null>(null);
  const [saving,setSaving]=useState(false);
  const [saveMessage,setSaveMessage]=useState("");

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const destinationParam=params.get("destination");
    const interestParam=params.get("interest");
    Promise.all([fetch("/api/destinations").then((r)=>r.json()),fetch("/api/events",{cache:"no-store"}).then((r)=>r.json())])
      .then(([destinationData,eventData])=>{
        const rows=Array.isArray(destinationData.destinations)?destinationData.destinations:[];
        const mapped=rows.map((d:Omit<Destination,"image">)=>({...d,image:destinationImages[d.slug]??destinationImages.kandy}));
        setDestinations(mapped);
        if(Array.isArray(eventData.seasons)&&eventData.seasons.length)setSeasons(eventData.seasons);
        if(destinationParam){const found=mapped.find((d:Destination)=>d.slug.toLowerCase()===destinationParam.toLowerCase());if(found){setSelected([found.slug]);setStep(3)}}
        if(interestParam){const found=interests.find((x)=>x.toLowerCase()===interestParam.toLowerCase());if(found)setInterest(found)}
      })
      .catch(()=>setDestinations([])).finally(()=>setLoading(false));

    try{
      const plan=JSON.parse(localStorage.getItem("discoverlanka-plan")??"{}");
      if(daysOptions.includes(plan.days))setDays(plan.days);
      if(Number.isInteger(plan.travelers))setTravelers(Math.max(1,Math.min(10,plan.travelers)));
      if(interests.includes(plan.interest))setInterest(plan.interest);
      if(budgets.includes(plan.budget))setBudget(plan.budget);
      const saved=JSON.parse(localStorage.getItem("discoverlanka-saved")??"[]");
      if(Array.isArray(saved))setSelected((current)=>Array.from(new Set([...current,...saved.filter((v):v is string=>typeof v==="string")])));
      const localItinerary=JSON.parse(localStorage.getItem("discoverlanka-itinerary")??"[]");
      if(Array.isArray(localItinerary)&&localItinerary.length){setItinerary(localItinerary);setGenerated(true);setStep(4)}
      const id=localStorage.getItem("discoverlanka-trip-id");if(id)setTripId(id);
    }catch{}
  },[]);

  useEffect(()=>{localStorage.setItem("discoverlanka-plan",JSON.stringify({days,travelers,interest,budget}))},[days,travelers,interest,budget]);

  const season=useMemo(()=>seasonForMonth(new Date().getMonth()+1,seasons),[seasons]);
  const suggested=useMemo(()=>{
    const order=routeOrder[interest]??routeOrder.Mountains;
    return [...order.map((slug)=>destinations.find((d)=>d.slug===slug)).filter(Boolean) as Destination[],...destinations.filter((d)=>!order.includes(d.slug))].slice(0,days>=10?4:3);
  },[interest,days,destinations]);
  const routeCandidates=useMemo(()=>[...suggested,...destinations.filter((d)=>!suggested.some((s)=>s.slug===d.slug))],[suggested,destinations]);
  const chosen=useMemo(()=>selected.map((slug)=>destinations.find((d)=>d.slug===slug)).filter(Boolean) as Destination[],[selected,destinations]);
  const routeCount=Math.max(1,chosen.length||suggested.length);
  const estimate=useMemo(()=>{
    const daily=dailyRates[budget]??dailyRates.Comfort;
    const accommodation=daily*.42*days*travelers;
    const food=daily*.23*days*travelers;
    const transport=daily*.18*days*travelers*Math.max(1,routeCount*.9);
    const activities=daily*.17*days*travelers*Math.max(1,routeCount*.9);
    return {accommodation,food,transport,activities,total:accommodation+food+transport+activities};
  },[budget,days,travelers,routeCount]);
  const money=(value:number)=>`LKR ${Math.round(value).toLocaleString("en-LK")}`;
  const toggleDestination=(slug:string)=>{setSelected((current)=>current.includes(slug)?current.filter((x)=>x!==slug):[...current,slug]);setGenerated(false)};
  const next=()=>setStep((current)=>Math.min(4,current+1));
  const back=()=>setStep((current)=>Math.max(1,current-1));

  async function generateTrip(){
    const route=(selected.length?selected:suggested.map((d)=>d.slug)).map((slug)=>destinations.find((d)=>d.slug===slug)).filter(Boolean) as Destination[];
    const usable=route.length?route:suggested;
    if(!usable.length)return;
    const template=templates[interest]??templates.Mountains;
    const daysPlan:ItineraryDay[]=Array.from({length:days},(_,index)=>{const destination=usable[index%usable.length];return {day:index+1,destination,focus:interest,items:template.map((item,j)=>j===2&&index>0?{...item,title:`Easy evening in ${destination.name}`}:{...item})}});
    const slugs=Array.from(new Set(usable.map((d)=>d.slug)));
    setItinerary(daysPlan);setGenerated(true);setStep(4);setSelected(slugs);localStorage.setItem("discoverlanka-saved",JSON.stringify(slugs));
    setSaving(true);setSaveMessage("");
    try{
      const tripResponse=await fetch("/api/trips",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:`Sri Lanka ${days}-day ${interest} journey`,days,travelers,interest,budgetLevel:budget,budgetEstimate:estimate.total,selectedSlugs:slugs,itinerary:daysPlan})});
      const tripData=await tripResponse.json();if(!tripResponse.ok)throw new Error(tripData.error??"Trip save failed");
      const newTripId=tripData.trip.id;setTripId(newTripId);localStorage.setItem("discoverlanka-trip-id",newTripId);
      const itineraryResponse=await fetch("/api/itineraries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tripId:newTripId,title:`${days}-day ${interest} itinerary`,summary:`Starter itinerary for ${travelers} ${travelers===1?"traveler":"travelers"}.`,durationDays:days,budgetLevel:budget,content:{days:daysPlan}})});
      if(!itineraryResponse.ok)throw new Error("Itinerary save failed");
      setSaveMessage("Saved to your live trip.");
    }catch(error){console.error(error);setSaveMessage("Saved in your browser. Server sync is unavailable right now.")}
    finally{localStorage.setItem("discoverlanka-itinerary",JSON.stringify(daysPlan));setSaving(false);setTimeout(()=>document.getElementById("itinerary")?.scrollIntoView({behavior:"smooth",block:"start"}),80)}
  }

  return <main className="min-h-screen bg-[#f7f5ef] text-[#10251f]">
    <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f7f5ef]/95 backdrop-blur-md"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6"><a href="/" className="text-xl font-bold tracking-tight">Discover<span className="text-[#d9a441]">Lanka</span></a><div className="flex items-center gap-3 sm:gap-5"><span className="hidden text-xs font-bold uppercase tracking-widest text-[#66756f] sm:inline">Concierge mode</span><a href="/my-trip" className="text-sm font-semibold text-[#66756f]">My Trip →</a></div></div></header>

    <section className="mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-6 md:pt-20">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.25em] text-[#b27c1d]">Luxury Trip Concierge</p><h1 className="mt-3 max-w-4xl text-5xl font-semibold tracking-[-.05em] md:text-7xl">Build a Sri Lankan journey that feels like yours.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#66756f]">A calm, guided flow for choosing the feeling, pace and places before we shape the route.</p></div><div className="max-w-sm rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/55 backdrop-blur">{season?.name??"Sri Lanka travel season"}<span className="mx-2 text-[#d8b875]">·</span>{new Date().toLocaleString("en-LK",{month:"long"})}<div className="mt-1 text-xs text-white/45">{season?.notes??"Use the season as a guide and keep some flexibility."}</div></div></div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_290px]">
        <section className="luxury-step-card p-6 sm:p-8 md:p-10">
          <div className="relative z-10 flex items-center justify-between border-b border-white/8 pb-5"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#d8b875]">Step {step} of 4</p><h2 className="mt-1 text-2xl font-semibold">{step===1?"Choose the feeling":step===2?"Set the pace":step===3?"Shape the route":"Your journey"}</h2></div><div className="flex gap-1.5">{[1,2,3,4].map((value)=><span key={value} className={`h-1.5 w-9 rounded-full ${value<=step?"bg-[#d8b875]":"bg-white/10"}`}/>)}</div></div>

          {step===1&&<div className="relative z-10 pt-7"><p className="text-xs font-bold uppercase tracking-[.17em] text-white/45">01 · What kind of Sri Lanka do you want to feel?</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{interests.map((item)=>{const image=destinationImages[(routeOrder[item]??routeOrder.Mountains)[0]]??destinationImages.ella;return <button key={item} onClick={()=>setInterest(item)} className={`group relative min-h-[150px] overflow-hidden rounded-2xl border text-left ${interest===item?"border-[#d8b875]/60":"border-white/8"}`}><img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-65 transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#07120f] via-[#07120f]/45 to-transparent"/><div className="relative flex h-full items-end p-4"><div><span className="luxury-step-number">{String(interests.indexOf(item)+1).padStart(2,"0")}</span><p className="mt-3 text-lg font-semibold text-white">{item}</p></div></div></button>})}</div><button onClick={next} className="mt-7 inline-flex rounded-full bg-[#d9a441] px-6 py-3.5 text-sm font-bold text-[#10251f]">Continue →</button></div>}

          {step===2&&<div className="relative z-10 space-y-8 pt-7"><div><p className="text-xs font-bold uppercase tracking-[.17em] text-white/45">02 · How long do you want to disappear for?</p><div className="mt-4 flex flex-wrap gap-2">{daysOptions.map((value)=><button key={value} onClick={()=>setDays(value)} className={`rounded-full px-5 py-3 text-sm font-bold ${days===value?"border border-[#d8b875]/50 bg-[#17362b] text-[#f4efe6]":"border border-white/10 bg-white/5 text-white/70"}`}>{value} days</button>)}</div></div><div><p className="text-xs font-bold uppercase tracking-[.17em] text-white/45">02b · Who is travelling?</p><div className="mt-4 flex items-center gap-3"><button onClick={()=>setTravelers(Math.max(1,travelers-1))} className="luxury-step-number h-11 w-11">−</button><span className="w-14 text-center text-2xl font-semibold">{travelers}</span><button onClick={()=>setTravelers(Math.min(10,travelers+1))} className="luxury-step-number h-11 w-11">+</button><span className="text-sm text-white/45">traveller{travelers===1?"":"s"}</span></div></div><div className="flex flex-wrap gap-3"><button onClick={back} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white/70">← Back</button><button onClick={next} className="rounded-full bg-[#d9a441] px-6 py-3 text-sm font-bold text-[#10251f]">Continue →</button></div></div>}

          {step===3&&<div className="relative z-10 pt-7"><div><p className="text-xs font-bold uppercase tracking-[.17em] text-white/45">03 · Choose your travel style</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{budgets.map((item)=><button key={item} onClick={()=>setBudget(item)} className={`rounded-2xl border p-5 text-left ${budget===item?"border-[#d8b875]/55 bg-[#17362b]":"border-white/8 bg-white/4"}`}><p className="text-lg font-semibold">{item}</p><p className="mt-1 text-xs text-white/45">{money(dailyRates[item])} base / person / day</p></button>)}</div></div><div className="mt-8"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.17em] text-white/45">03b · Pick places to carry with you</p><p className="mt-1 text-sm text-white/45">{selected.length} selected · suggestions adapt to your interest.</p></div><button onClick={()=>setSelected([])} className="text-xs font-bold uppercase tracking-[.15em] text-[#d8b875]">Clear</button></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{routeCandidates.map((destination)=><button key={destination.slug} onClick={()=>toggleDestination(destination.slug)} className={`group relative min-h-[175px] overflow-hidden rounded-2xl border text-left ${selected.includes(destination.slug)?"border-[#d8b875]/60":"border-white/8"}`}><img src={destination.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#07120f] via-[#07120f]/45 to-transparent"/><div className="relative flex h-full items-end justify-between p-4"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#d8b875]">{destination.region}</p><p className="mt-1 text-lg font-semibold">{destination.name}</p></div><span className={`rounded-full border px-3 py-1 text-[10px] font-bold ${selected.includes(destination.slug)?"border-[#d8b875]/40 bg-[#d8b875]/16 text-[#f4efe6]":"border-white/15 bg-black/20 text-white/65"}`}>{selected.includes(destination.slug)?"Selected":"+ Add"}</span></div></button>)}</div></div><div className="mt-8 flex flex-wrap gap-3"><button onClick={back} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white/70">← Back</button><button onClick={generateTrip} disabled={loading} className="rounded-full bg-[#d9a441] px-6 py-3 text-sm font-bold text-[#10251f] disabled:opacity-50">Build my journey ↗</button></div></div>}

          {step===4&&<div className="relative z-10 pt-7"><div className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-white/8 bg-white/4 p-5"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/45">Journey</p><p className="mt-2 text-2xl font-semibold">{days} days · {travelers} traveller{travelers===1?"":"s"}</p><p className="mt-1 text-sm text-white/45">{interest} · {budget}</p></div><div className="rounded-2xl border border-[#d8b875]/20 bg-[#17362b]/60 p-5"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#d8b875]">Estimated total</p><p className="mt-2 text-2xl font-semibold">{money(estimate.total)}</p><p className="mt-1 text-sm text-white/45">Planning estimate, not a booking quote.</p></div></div><div data-golden-route className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{chosen.map((destination,index)=><div key={destination.slug} className="golden-route-node rounded-2xl border border-white/8 bg-black/10 p-4 pl-10"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#d8b875]">Stop {index+1}</p><p className="mt-1 font-semibold">{destination.name}</p><p className="mt-0.5 text-xs text-white/45">{destination.region}</p></div>)}</div><div className="mt-6 flex flex-wrap gap-3"><button onClick={()=>setStep(3)} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white/70">← Adjust</button><button onClick={generateTrip} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white/80">↻ Rebuild</button><a href="/my-trip" className="rounded-full bg-[#d9a441] px-6 py-3 text-sm font-bold text-[#10251f]">Open My Trip →</a></div>{saveMessage&&<p className="mt-4 text-sm text-[#d8b875]">{saveMessage}{saving?" Saving…":""}</p>}<p className="mt-4 text-xs text-white/35">Trip ID: {tripId??"Browser draft"}</p></div>}
        </section>

        <aside className="luxury-step-card h-fit p-6 sm:p-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#d8b875]">Your desk</p><div className="mt-4 space-y-3"><div className="rounded-2xl border border-white/8 bg-white/4 p-4"><p className="text-[10px] uppercase tracking-[.16em] text-white/45">Feeling</p><p className="mt-1 font-semibold">{interest}</p></div><div className="rounded-2xl border border-white/8 bg-white/4 p-4"><p className="text-[10px] uppercase tracking-[.16em] text-white/45">Pace</p><p className="mt-1 font-semibold">{days} days · {travelers} traveller{travelers===1?"":"s"}</p></div><div className="rounded-2xl border border-white/8 bg-white/4 p-4"><p className="text-[10px] uppercase tracking-[.16em] text-white/45">Style</p><p className="mt-1 font-semibold">{budget}</p></div></div><div className="mt-5 border-t border-white/8 pt-5"><p className="text-[10px] uppercase tracking-[.16em] text-white/45">Estimated</p><p className="mt-1 text-2xl font-semibold">{money(estimate.total)}</p><p className="mt-2 text-xs leading-5 text-white/38">Accommodation {money(estimate.accommodation)} · Food {money(estimate.food)} · Transport {money(estimate.transport)} · Activities {money(estimate.activities)}</p></div></aside>
      </div>

      {generated&&<section id="itinerary" className="luxury-step-card mt-10 p-7 sm:p-9"><div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#d8b875]">Live itinerary</p><h2 className="mt-2 text-3xl font-semibold">A first draft worth refining.</h2><p className="mt-2 text-sm text-white/50">{days} days · {interest} · {budget}</p></div><a href="/my-trip" className="text-sm font-bold text-[#d8b875]">Open My Trip →</a></div><div className="mt-7 grid gap-4 lg:grid-cols-2">{itinerary.map((day)=><article key={day.day} className="rounded-2xl border border-white/8 bg-black/10 p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#d8b875]">Day {day.day}</p><h3 className="mt-1 text-xl font-semibold">{day.destination.name}</h3></div><span className="text-xs text-white/45">{day.destination.region}</span></div><div className="mt-4 grid gap-2 sm:grid-cols-3">{day.items.map((item,index)=><div key={index} className="rounded-xl border border-white/7 bg-white/4 p-3"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#d8b875]">{item.time}</p><p className="mt-1 text-sm font-semibold text-white/88">{item.title}</p></div>)}</div></article>)}</div></section>}
      {loading&&<p className="mt-6 text-center text-sm text-[#66756f]">Loading destinations…</p>}
    </section>
  </main>;
}
