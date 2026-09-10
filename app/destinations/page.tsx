import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

type Destination = { id:string; slug:string; name:string; region:string; summary:string; best_time:string; latitude:number; longitude:number };

const images:Record<string,string>={
  kandy:"https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1800&q=88",
  ella:"https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=1800&q=88",
  galle:"https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=1800&q=88",
  sigiriya:"https://images.unsplash.com/photo-1588598198321-9735fd5246b8?auto=format&fit=crop&w=1800&q=88",
  yala:"https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=1800&q=88",
  mirissa:"https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1800&q=88",
  "nuwara-eliya":"https://images.unsplash.com/photo-1590123221594-8c5d2c5f3f44?auto=format&fit=crop&w=1800&q=88",
  anuradhapura:"https://images.unsplash.com/photo-1588258524675-c7f1e3e8d5d8?auto=format&fit=crop&w=1800&q=88"
};

async function getDestinations(){
  if(!process.env.DATABASE_URL)return [];
  const sql=neon(process.env.DATABASE_URL);
  const rows=await sql`SELECT id,slug,name,region,summary,best_time,latitude,longitude FROM destinations ORDER BY name ASC`;
  return rows as Destination[];
}

export default async function DestinationsPage(){
  const destinations=await getDestinations().catch(()=>[]);
  const lead=destinations.find(x=>x.slug==="ella")??destinations[0];
  const rest=destinations.filter(x=>x.id!==lead?.id);
  return <main className="min-h-screen bg-[#07120f] text-[#f4efe6]">
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-black/20 px-5 py-4 backdrop-blur-xl">
        <a href="/" className="text-xl font-semibold tracking-tight">Discover<span className="text-[#d8b875]">Lanka</span></a>
        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex"><a href="/">Discover</a><a className="text-white" href="/destinations">Destinations</a><a href="/experiences">Experiences</a><a href="/stories">Stories</a><a href="/plan">Plan</a><a href="/my-trip">My Trip</a></nav>
        <a href="/plan" className="premium-button premium-button-gold rounded-full px-4 py-2 text-xs font-extrabold">Build My Trip ↗</a>
      </div>
    </header>

    <section className="mx-auto max-w-7xl px-5 pb-14 pt-24 sm:px-8 md:pt-32">
      <p className="luxury-section-eyebrow">The island, refined</p>
      <h1 className="luxury-display-small mt-5 max-w-5xl text-6xl md:text-8xl">Choose the place for how you want the day to feel.</h1>
      <p className="mt-7 max-w-2xl text-base leading-8 text-white/60 md:text-lg">From misty tea country to wild plains and sea-facing old towns, start with a place and let the journey build around it.</p>
    </section>

    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
      {lead && <a href={`/destinations/${lead.slug}`} className="group relative mb-5 block min-h-[560px] overflow-hidden rounded-[2rem] border border-white/12">
        <img src={images[lead.slug]??images.ella} alt={lead.name} className="absolute inset-0 h-full w-full object-cover transition duration-[1400ms] group-hover:scale-105"/>
        <div className="absolute inset-0 bg-gradient-to-t from-[#06100d] via-[#06100d]/25 to-transparent"/>
        <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
          <div className="route-hero-panel max-w-2xl">
            <p className="luxury-section-eyebrow">01 · Featured destination · {lead.region}</p>
            <h2 className="mt-3 luxury-display-small text-5xl sm:text-7xl">{lead.name}</h2>
            <p className="mt-4 max-w-xl text-white/68">{lead.summary}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[.18em] text-white/72"><span>Best time · {lead.best_time}</span><span className="text-[#d8b875]">Explore destination ↗</span></div>
          </div>
        </div>
      </a>}

      <div className="luxury-focus-grid">
        {rest.map((destination,index)=><a key={destination.id} href={`/destinations/${destination.slug}`} className={`luxury-focus-card group ${index===0?"col-span-7":"col-span-5"}`}>
          <img src={images[destination.slug]??images.kandy} alt={destination.name} className="absolute inset-0 h-full w-full object-cover" loading="lazy"/>
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
            <p className="luxury-section-eyebrow">{String(index+2).padStart(2,"0")} · {destination.region}</p>
            <h2 className="mt-2 font-serif text-3xl tracking-tight">{destination.name}</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/60">{destination.summary}</p>
            <div className="mt-4 text-xs font-bold uppercase tracking-[.18em] text-white/72">Explore ↗</div>
          </div>
        </a>)}
      </div>
    </section>
  </main>;
}
