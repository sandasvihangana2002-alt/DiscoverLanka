"use client";

import { useEffect, useMemo, useState } from "react";

type Destination = {
  id:string; slug:string; name:string; region:string; summary:string;
  best_time:string; latitude:number; longitude:number; review_count:number;
};

const images:Record<string,string>={
  kandy:"https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=2200&q=88",
  ella:"https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=2200&q=88",
  galle:"https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=2200&q=88",
  sigiriya:"https://images.unsplash.com/photo-1588598198321-9735fd5246b8?auto=format&fit=crop&w=2200&q=88",
  yala:"https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=2200&q=88",
  mirissa:"https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=2200&q=88",
  "nuwara-eliya":"https://images.unsplash.com/photo-1590123221594-8c5d2c5f3f44?auto=format&fit=crop&w=2200&q=88",
  anuradhapura:"https://images.unsplash.com/photo-1588258524675-c7f1e3e8d5d8?auto=format&fit=crop&w=2200&q=88",
  trincomalee:"https://images.unsplash.com/photo-1694869248690-2956574b7032?auto=format&fit=crop&w=2200&q=88",
  "arugam-bay":"https://yalu.travel/content/images/2025/08/yalulife_arugam_bay_surfing.jpg",
  jaffna:"https://images.unsplash.com/photo-1725773682183-f0c885081ce5?auto=format&fit=crop&w=2200&q=88",
  udawalawe:"https://advantiko.com/wp-content/uploads/2020/06/udawalawe-national-park2.jpg",
  "adams-peak":"https://commons.wikimedia.org/wiki/Special:FilePath/Sri%20Padaya%20-%20Adam%27s%20peak.jpg"
};

const guide:Record<string,{mood:string;highlights:string[];tips:string[]}>={
 kandy:{mood:"Culture, ceremony & cool hill-country evenings",highlights:["Walk the lake and old city at an unhurried pace","Make time for local food and tea","Pair the city with a quieter hill-country stop"],tips:["Start cultural visits earlier in the day","Leave space for traffic and hill roads","Use this as a base for short Central Province day trips"]},
 ella:{mood:"Mountain views, walks & slow mornings",highlights:["Build days around one main trail or viewpoint","Keep time for tea-country landscapes","Mix popular sights with quieter village roads"],tips:["Weather can change quickly in the hills","Do not over-pack the day with viewpoints","Early starts usually make the day feel calmer"]},
 galle:{mood:"Heritage walls, cafés & the southern coast",highlights:["Explore the historic fort on foot","Add a beach or coastal stop nearby","Use the evening for a slower old-town wander"],tips:["Comfortable shoes help on long fort walks","Sunset is a good time for a relaxed coastal plan","Combine with nearby south-coast beaches for longer stays"]},
 sigiriya:{mood:"Ancient landscapes, rock views & dry-zone adventure",highlights:["Go early for a cooler climb","Pair the rock area with another heritage stop","Use the surrounding countryside for a slower afternoon"],tips:["Protect the morning for your main climb","Carry water and plan a recovery break","Avoid making every stop a major attraction"]},
 yala:{mood:"Wildlife, open landscapes & nature-first days",highlights:["Keep safari time as the anchor of the day","Leave room for the surrounding landscape","Choose slower evenings after an early start"],tips:["Treat wildlife viewing as an unhurried experience","Keep expectations flexible around animal sightings","Pair wildlife days with recovery time rather than back-to-back activities"]},
 mirissa:{mood:"Beach mornings, sea air & relaxed coastal nights",highlights:["Start with a quiet shoreline walk","Leave afternoons flexible around the heat","Finish with a sunset and local dinner"],tips:["Keep marine activities tied to current local conditions","Build in a slower afternoon","Combine with nearby south-coast towns for variety"]},
 "nuwara-eliya":{mood:"Tea country, misty hills & cool-weather escapes",highlights:["Spend time among tea landscapes","Choose one scenic road or viewpoint","Keep evenings simple and warm"],tips:["Pack for cooler evenings","Allow more time for winding hill roads","Do not judge the day only by visibility; mist is part of the mood"]},
 anuradhapura:{mood:"Ancient city, sacred spaces & wide-open history",highlights:["Give major heritage areas plenty of time","Move between sites at a calm pace","Pair history with nearby cultural stops"],tips:["Dress respectfully at sacred sites","Plan around heat and walking time","An early start makes a long heritage day more comfortable"]},
 trincomalee:{mood:"Turquoise water, sacred cliffs & slow east-coast days",highlights:["Give Nilaveli or Uppuveli a full unhurried morning","Pair the coast with Fort Frederick and Koneswaram","Leave an evening free for the harbour sunset"],tips:["May to September is the strongest east-coast window","Keep marine plans flexible around sea conditions","Allow extra time for the northbound coastal road"]},
 "arugam-bay":{mood:"Surf, lagoons & easygoing east-coast village life",highlights:["Build the day around the surf conditions","Explore lagoon and wildlife areas away from the main strip","Keep evenings relaxed with local food and a beach walk"],tips:["May to September is the main surf season","Use a local instructor if you are new to the breaks","Do not pack surf, lagoon and safari activities into one rushed day"]},
 jaffna:{mood:"Northern heritage, bold flavours & island-road discovery",highlights:["Spend time around Nallur and the old city","Explore the food culture through a local-led trail","Keep a half-day for a quieter island or coastal drive"],tips:["Dress respectfully at active religious sites","Midday heat can be strong, so pace long walks","Leave room for local food stops rather than fixed meal times"]},
 udawalawe:{mood:"Open grasslands, elephants & quiet wildlife mornings",highlights:["Make an early safari the anchor of the stay","Use the afternoon for a slower village or countryside experience","Keep the route flexible around wildlife and heat"],tips:["Early starts are usually the most comfortable","Wildlife sightings are never guaranteed, so keep expectations flexible","Combine safari time with a rest period rather than another long drive"]},
 "adams-peak":{mood:"Sacred pilgrimage, mountain air & a sunrise worth the climb",highlights:["Climb the pilgrimage route on foot and experience the changing atmosphere as you gain height","Reach the summit around dawn when conditions allow and take in the surrounding mountain landscape","Notice the living pilgrimage traditions and places of worship along the route"],tips:["The main pilgrimage season runs roughly from December to May","Two established approaches include the Hatton side and the Ratnapura side; the climb is on foot","Expect a demanding stair climb, changing weather and colder conditions near the summit; carry water and pace yourself"]}
};

const fallbackGuide={mood:"A Sri Lankan place worth exploring at your own pace",highlights:["Take the day slowly and leave room for discovery","Mix a signature sight with a quieter local experience","Use the destination as one part of a wider route"],tips:["Check your route before locking in every stop","Leave buffer time for transport","Build the day around your interests"]};

export default function DestinationExplorer({destinations}:{destinations:Destination[]}){
  const [selectedSlug,setSelectedSlug]=useState<string|null>(null);
  const selected=useMemo(()=>destinations.find(d=>d.slug===selectedSlug)??null,[destinations,selectedSlug]);
  const select=(slug:string)=>{setSelectedSlug(slug);window.history.pushState({destination:slug},"",window.location.pathname+"#"+slug);window.scrollTo({top:0,behavior:"smooth"});};
  const back=()=>{setSelectedSlug(null);window.history.pushState({}, "", window.location.pathname);window.scrollTo({top:0,behavior:"smooth"});};

  useEffect(()=>{
    const onPop=()=>{setSelectedSlug(window.location.hash.replace("#","")||null);};
    window.addEventListener("popstate",onPop);
    const hash=window.location.hash.replace("#","");
    if(hash && destinations.some(d=>d.slug===hash)) setSelectedSlug(hash);
    return()=>window.removeEventListener("popstate",onPop);
  },[destinations]);

  if(selected){
    const image=images[selected.slug];
    const g=guide[selected.slug]??fallbackGuide;
    return <main className="destination-inline-page min-h-screen bg-[#0a1712] text-[#f4efe6]">
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/15 bg-black/25 px-5 py-3.5 backdrop-blur-2xl">
          <button onClick={back} className="text-xl font-semibold">Discover<span className="text-[#d8b875]">Lanka</span></button>
          <button onClick={back} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[.14em] text-white/75">← All destinations</button>
        </div>
      </header>
      <section className="destination-inline-enter relative min-h-[86svh] overflow-hidden">
        <img src={image} alt={selected.name} className="absolute inset-0 h-full w-full object-cover"/>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,10,8,.25),rgba(3,10,8,.16)_38%,rgba(3,10,8,.98)_100%)]"/>
        <div className="relative mx-auto flex min-h-[86svh] max-w-7xl items-end px-5 pb-14 pt-32 sm:px-8 md:pb-20">
          <div className="max-w-4xl">
            <p className="luxury-section-eyebrow">{selected.region}</p>
            <h1 className="destination-inline-title mt-3">{selected.name}</h1>
            <p className="destination-inline-copy mt-6 max-w-2xl">{selected.summary}</p>
            <div className="mt-7 flex flex-wrap gap-3"><a href={`/plan?destination=${encodeURIComponent(selected.slug)}`} className="premium-button premium-button-gold rounded-full px-6 py-3 text-xs font-extrabold uppercase tracking-[.16em]">Build My Trip ↗</a></div>
          </div>
        </div>
      </section>
      <section className="destination-inline-content mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <article>
            <p className="luxury-section-eyebrow">About the destination</p>
            <h2 className="destination-inline-heading mt-3">A place worth taking your time with.</h2>
            <p className="destination-inline-copy mt-7">{selected.slug==="adams-peak" ? "Adam’s Peak, known locally as Sri Pada and Samanala Kanda, is a sacred mountain in the central highlands of Sri Lanka. During the main pilgrimage season, devotees and travellers climb through the night to reach the summit around sunrise. The journey combines sacred heritage, mountain scenery and a demanding walking route." : "Explore the character of this destination at your own pace, with space for local culture, landscape, food and the experiences that make this part of Sri Lanka distinctive."}</p>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              <div className="destination-inline-card"><p className="luxury-section-eyebrow">The feel</p><h3>{g.mood}</h3></div>
              <div className="destination-inline-card"><p className="luxury-section-eyebrow">Best time</p><h3>{selected.best_time}</h3></div>
            </div>
          </article>
          <aside className="destination-inline-plan">
            <p className="luxury-section-eyebrow">Plan your visit</p>
            <div className="mt-6 space-y-5"><div><span>Region</span><strong>{selected.region}</strong></div><div><span>Coordinates</span><strong>{selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}</strong></div></div>
            <a href={`/plan?destination=${encodeURIComponent(selected.slug)}`} className="premium-button premium-button-gold mt-8 block rounded-full px-5 py-3 text-center text-xs font-extrabold uppercase tracking-[.16em]">Plan around {selected.name} ↗</a>
          </aside>
        </div>
        <div className="mt-20 grid gap-8 md:grid-cols-2">
          <div className="destination-inline-list"><p className="luxury-section-eyebrow">Things to do</p><div className="mt-5 space-y-3">{g.highlights.map(x=><div key={x}>{x}</div>)}</div></div>
          <div className="destination-inline-list"><p className="luxury-section-eyebrow">Planning notes</p><div className="mt-5 space-y-3">{g.tips.map(x=><div key={x}>{x}</div>)}</div></div>
        </div>
        <div className="mt-20 flex items-center justify-between gap-5 border-t border-white/10 pt-8">
          <div><p className="luxury-section-eyebrow">Continue exploring</p><h2 className="mt-2 font-serif text-3xl">Find another place.</h2></div>
          <button onClick={back} className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-[.14em]">← Destinations</button>
        </div>
      </section>
      <style>{`
.destination-inline-page{background:radial-gradient(circle at 12% 12%,rgba(216,184,117,.08),transparent 25%),radial-gradient(circle at 88% 32%,rgba(46,104,80,.13),transparent 30%),#0a1712}
.destination-inline-enter{animation:destinationReveal .75s cubic-bezier(.2,.8,.2,1) both}
.destination-inline-title{font-family:"amoera","Amoera",sans-serif;font-size:clamp(4.2rem,9vw,8.5rem);font-weight:700;letter-spacing:-.055em;line-height:.84}
.destination-inline-heading{font-family:"amoera","Amoera",sans-serif;font-size:clamp(3rem,6vw,5.8rem);font-weight:700;letter-spacing:-.04em;line-height:.9}
.destination-inline-copy{font-family:"Cormorant","Cormorant Garamond",Georgia,serif;font-size:clamp(1.12rem,1.6vw,1.42rem);line-height:1.72;color:rgba(244,239,230,.68)}
.destination-inline-card,.destination-inline-list,.destination-inline-plan{border:1px solid rgba(255,255,255,.09);background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.028));box-shadow:0 24px 70px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.045);backdrop-filter:blur(20px);border-radius:1.8rem;padding:1.8rem}
.destination-inline-card h3{font-family:"amoera","Amoera",sans-serif;font-size:1.7rem;line-height:1.05;margin-top:.8rem}
.destination-inline-plan span{display:block;font:700 .58rem/1 Inter,system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.42)}
.destination-inline-plan strong{display:block;margin-top:.45rem;font-family:"Cormorant","Cormorant Garamond",Georgia,serif;font-size:1.2rem;font-weight:500}
.destination-inline-list>div>div{font-family:"Cormorant","Cormorant Garamond",Georgia,serif;font-size:1.12rem;line-height:1.45;color:rgba(244,239,230,.72);border:1px solid rgba(255,255,255,.07);border-radius:1rem;padding:1rem 1.1rem;background:rgba(255,255,255,.025);transition:transform .25s ease,background .25s ease}
.destination-inline-list>div>div:hover{transform:translateX(4px);background:rgba(216,184,117,.065)}
.destination-inline-page .luxury-section-eyebrow{color:#d8b875;font-size:.58rem;font-weight:800;letter-spacing:.26em;text-transform:uppercase}
@keyframes destinationReveal{from{opacity:0;transform:translateY(24px) scale(.985);filter:blur(4px)}to{opacity:1;transform:none;filter:none}}
@media(max-width:640px){.destination-inline-title{font-size:4rem}.destination-inline-heading{font-size:3rem}}
`}</style>
    </main>;
  }

  return <main className="destinations-page min-h-screen bg-[#07120f] text-[#f4efe6]">
    <header className="home-nav fixed inset-x-0 top-0 z-50 px-4 py-5 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-[#d9b972]/25 bg-[#07140f]/52 px-5 py-3.5 text-white shadow-[0_18px_60px_rgba(0,0,0,.24)] backdrop-blur-2xl sm:px-7"><a href="/" className="home-brand group flex items-center gap-2.5" aria-label="DiscoverLanka home"><span className="font-serif text-xl tracking-[-.03em] sm:text-2xl">Discover<span className="text-[#d9b972]">Lanka</span></span></a><nav className="hidden items-center gap-8 text-[10px] font-black uppercase tracking-[.17em] text-white/70 lg:flex" aria-label="Primary navigation"><a className="home-nav-link" href="/">Discover</a><a className="home-nav-link" href="/destinations">Destinations</a><a className="home-nav-link" href="/stories">Stories</a><a className="home-nav-link" href="/plan">Plan</a><a className="home-nav-link" href="/#map">Map</a><a className="home-nav-link" href="/my-trip">My Trip</a></nav><div className="flex items-center gap-2"><a href="/search" className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm sm:inline-flex" aria-label="Search">⌕</a><a href="/plan" className="home-trip-cta hidden rounded-full bg-[#e3bd78] px-5 py-3 text-[11px] font-black uppercase tracking-[.12em] text-[#102018] sm:inline-flex">Build My Trip ↗</a><a href="/plan" className="inline-flex h-10 items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 text-[10px] font-black uppercase tracking-[.13em] text-white/80 lg:hidden">Plan ↗</a></div></div><div className="home-nav-ornament" aria-hidden="true"><span>◆</span><i></i><span>◆</span></div></header>
    <section className="mx-auto max-w-7xl px-5 pb-12 pt-28 sm:px-8 md:pt-36"><div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"><div className="max-w-4xl"><p className="destinations-eyebrow luxury-section-eyebrow">Discover Sri Lanka</p><h1 className="destinations-main-heading luxury-display-small mt-5 text-6xl md:text-8xl">Find a place worth remembering.</h1><p className="destinations-intro mt-7 max-w-2xl text-base leading-8 text-white/60 md:text-lg">Explore coastlines, ancient cities, mountain escapes and wild landscapes — each destination with its own rhythm.</p></div><div className="shrink-0 rounded-full border border-white/10 bg-white/[.045] px-5 py-3 text-center backdrop-blur-xl"><span className="block text-2xl font-semibold text-[#e4c681]">{destinations.length}</span><span className="text-[9px] font-black uppercase tracking-[.2em] text-white/45">Destinations</span></div></div></section>
    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8"><div className="mb-8 flex items-center justify-between border-b border-white/10 pb-5"><div><p className="destinations-card-meta luxury-section-eyebrow">The destination collection</p><h2 className="mt-2 font-serif text-3xl tracking-tight text-white sm:text-4xl">Places to explore</h2></div><span className="hidden text-xs text-white/35 sm:block">Click a destination to explore ↓</span></div><div className="destination-card-grid">{destinations.map((destination,index)=>{const image=images[destination.slug];return <button key={destination.id} onClick={()=>select(destination.slug)} className="destination-travel-card group text-left"><div className="destination-card-image-wrap"><img src={image} alt={destination.name} className="destination-card-image" loading={index<4?"eager":"lazy"}/><div className="destination-card-image-shade"/><div className="destination-card-top"><span>{destination.region}</span><span className="destination-heart" aria-hidden="true">♡</span></div><div className="destination-card-number">{String(index+1).padStart(2,"0")}</div></div><div className="destination-card-body"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="destination-card-title">{destination.name}</h2><p className="destination-card-copy">{destination.summary}</p></div><span className="destination-card-arrow" aria-hidden="true">↗</span></div><div className="destination-card-meta-row"><span className="destination-rating"><b>★</b>{destination.review_count>0?destination.review_count+" reviews":"No reviews yet"}</span><span>Best · {destination.best_time}</span></div></div></button>})}</div></section>
    <style>{`
.destination-card-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;align-items:start}.destination-travel-card{position:relative;display:block;width:100%;overflow:hidden;border:1px solid rgba(255,255,255,.09);border-radius:28px;background:#f5f0e6;color:#10251f;box-shadow:0 20px 55px rgba(0,0,0,.20);transition:transform .38s cubic-bezier(.2,.8,.2,1),box-shadow .38s ease,border-color .3s ease;cursor:pointer}.destination-travel-card:hover{transform:translateY(-8px);box-shadow:0 34px 80px rgba(0,0,0,.30);border-color:rgba(216,184,117,.42)}.destination-card-image-wrap{position:relative;height:380px;overflow:hidden;background:#16382f}.destination-card-image{width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.2,.75,.2,1),filter .5s ease}.destination-travel-card:hover .destination-card-image{transform:scale(1.07);filter:saturate(1.06) contrast(1.03)}.destination-card-image-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,10,7,.34),transparent 45%,rgba(3,10,7,.62))}.destination-card-top{position:absolute;inset:16px 16px auto;display:flex;align-items:center;justify-content:space-between;color:#fff;font:800 9px/1 Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase}.destination-card-top>span:first-child{padding:8px 10px;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:rgba(7,18,14,.34);backdrop-filter:blur(12px)}.destination-heart{display:flex;width:36px;height:36px;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.22);border-radius:50%;background:rgba(7,18,14,.34);font-size:20px;line-height:1;backdrop-filter:blur(12px)}.destination-card-number{position:absolute;right:17px;bottom:15px;color:rgba(255,255,255,.58);font:700 10px/1 Inter,system-ui,sans-serif;letter-spacing:.16em}.destination-card-body{position:relative;min-height:174px;margin:-24px 14px 14px;padding:25px 22px 20px;border-radius:22px;background:linear-gradient(145deg,#fbf8f1,#eee7d9);box-shadow:0 12px 30px rgba(0,0,0,.12);z-index:2}.destination-card-title{margin:0;color:#10251f!important;font-family:"amoera","Amoera",sans-serif!important;font-size:clamp(1.75rem,1.48rem + .62vw,2.3rem);font-weight:700;letter-spacing:-.018em;line-height:1.02}.destination-card-copy{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;margin:9px 0 0;color:#607169;font-family:"Cormorant","Cormorant Garamond",Georgia,serif;font-size:1.08rem;line-height:1.42}.destination-card-arrow{display:flex;width:34px;height:34px;flex:0 0 auto;align-items:center;justify-content:center;border:1px solid rgba(16,37,31,.12);border-radius:50%;color:#17382d;font:600 16px/1 Inter,system-ui,sans-serif;transition:transform .25s ease,background .25s ease}.destination-travel-card:hover .destination-card-arrow{transform:translate(2px,-2px);background:rgba(216,184,117,.16)}.destination-card-meta-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:16px;padding-top:12px;border-top:1px solid rgba(16,37,31,.10);color:#718078;font:800 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.09em;text-transform:uppercase}.destination-rating{display:inline-flex;align-items:center;gap:5px;color:#66766d}.destination-rating b{color:#bd8f36;font-size:11px}@media(max-width:1100px){.destination-card-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}}@media(max-width:560px){.destination-card-grid{grid-template-columns:1fr;gap:18px}.destination-card-image-wrap{height:300px}.destination-card-body{margin:-20px 9px 9px;padding:22px 19px 17px}}
`}</style>
  </main>;
}
