import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

type Destination = {
  id:string;
  slug:string;
  name:string;
  region:string;
  summary:string;
  best_time:string;
  latitude:number;
  longitude:number;
  review_count:number;
};

const images:Record<string,string>={
  kandy:"https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=88",
  ella:"https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=1600&q=88",
  galle:"https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=1600&q=88",
  sigiriya:"https://images.unsplash.com/photo-1588598198321-9735fd5246b8?auto=format&fit=crop&w=1600&q=88",
  yala:"https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=1600&q=88",
  mirissa:"https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1600&q=88",
  "nuwara-eliya":"https://images.unsplash.com/photo-1590123221594-8c5d2c5f3f44?auto=format&fit=crop&w=1600&q=88",
  anuradhapura:"https://images.unsplash.com/photo-1588258524675-c7f1e3e8d5d8?auto=format&fit=crop&w=1600&q=88",
  trincomalee:"https://images.unsplash.com/photo-1694869248690-2956574b7032?auto=format&fit=crop&w=1600&q=88",
  "arugam-bay":"https://yalu.travel/content/images/2025/08/yalulife_arugam_bay_surfing.jpg",
  jaffna:"https://images.unsplash.com/photo-1725773682183-f0c885081ce5?auto=format&fit=crop&w=1600&q=88",
  udawalawe:"https://advantiko.com/wp-content/uploads/2020/06/udawalawe-national-park2.jpg"
};

function fallbackImage(slug:string,index:number){
  return `https://loremflickr.com/1400/1000/sri-lanka,${encodeURIComponent(slug)}?lock=${index+100}`;
}

async function getDestinations(){
  if(!process.env.DATABASE_URL)return [];
  const sql=neon(process.env.DATABASE_URL);
  const rows=await sql`
    SELECT
      d.id,d.slug,d.name,d.region,d.summary,d.best_time,d.latitude,d.longitude,
      COUNT(r.id)::int AS review_count
    FROM destinations d
    LEFT JOIN reviews r ON r.destination_id=d.id
    GROUP BY d.id
    ORDER BY d.name ASC
  `;
  return rows as Destination[];
}

export default async function DestinationsPage(){
  const destinations=await getDestinations().catch(()=>[]);

  return <main className="destinations-page min-h-screen bg-[#07120f] text-[#f4efe6]">
    <header className="home-nav fixed inset-x-0 top-0 z-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-[#d9b972]/25 bg-[#07140f]/52 px-5 py-3.5 text-white shadow-[0_18px_60px_rgba(0,0,0,.24)] backdrop-blur-2xl sm:px-7">
        <a href="/" className="home-brand group flex items-center gap-2.5" aria-label="DiscoverLanka home">
          <span className="font-serif text-xl tracking-[-.03em] sm:text-2xl">Discover<span className="text-[#d9b972]">Lanka</span></span>
        </a>
        <nav className="hidden items-center gap-8 text-[10px] font-black uppercase tracking-[.17em] text-white/70 lg:flex" aria-label="Primary navigation">
          <a className="home-nav-link" href="/">Discover</a><a className="home-nav-link" href="/destinations">Destinations</a><a className="home-nav-link" href="/experiences">Experiences</a><a className="home-nav-link" href="/stories">Stories</a><a className="home-nav-link" href="/plan">Plan</a><a className="home-nav-link" href="/#map">Map</a><a className="home-nav-link" href="/my-trip">My Trip</a>
        </nav>
        <div className="flex items-center gap-2">
          <a href="/search" className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm sm:inline-flex" aria-label="Search">⌕</a>
          <a href="/plan" className="home-trip-cta hidden rounded-full bg-[#e3bd78] px-5 py-3 text-[11px] font-black uppercase tracking-[.12em] text-[#102018] sm:inline-flex">Build My Trip ↗</a>
          <a href="/plan" className="inline-flex h-10 items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 text-[10px] font-black uppercase tracking-[.13em] text-white/80 lg:hidden">Plan ↗</a>
        </div>
      </div>
      <div className="home-nav-ornament" aria-hidden="true"><span>◆</span><i></i><span>◆</span></div>
    </header>

    <section className="mx-auto max-w-7xl px-5 pb-12 pt-28 sm:px-8 md:pt-36">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-4xl">
          <p className="destinations-eyebrow luxury-section-eyebrow">Discover Sri Lanka</p>
          <h1 className="destinations-main-heading luxury-display-small mt-5 text-6xl md:text-8xl">Find a place worth remembering.</h1>
          <p className="destinations-intro mt-7 max-w-2xl text-base leading-8 text-white/60 md:text-lg">Explore coastlines, ancient cities, mountain escapes and wild landscapes — each destination with its own rhythm.</p>
        </div>
        <div className="shrink-0 rounded-full border border-white/10 bg-white/[.045] px-5 py-3 text-center backdrop-blur-xl">
          <span className="block text-2xl font-semibold text-[#e4c681]">{destinations.length}</span>
          <span className="text-[9px] font-black uppercase tracking-[.2em] text-white/45">Destinations</span>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
      <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">
        <div>
          <p className="destinations-card-meta luxury-section-eyebrow">The destination collection</p>
          <h2 className="mt-2 font-serif text-3xl tracking-tight text-white sm:text-4xl">Places to explore</h2>
        </div>
        <span className="hidden text-xs text-white/35 sm:block">Scroll the collection ↓</span>
      </div>

      <div className="destination-card-grid">
        {destinations.map((destination,index)=>{
          const image=images[destination.slug]??fallbackImage(destination.slug,index);
          return <a
            key={destination.id}
            href={`/destinations/${destination.slug}`}
            className="destination-travel-card group"
          >
            <div className="destination-card-image-wrap">
              <img
                src={image}
                alt={destination.name}
                className="destination-card-image"
                loading={index<4?"eager":"lazy"}
              />
              <div className="destination-card-image-shade"/>
              <div className="destination-card-top">
                <span>{destination.region}</span>
                <span className="destination-heart" aria-hidden="true">♡</span>
              </div>
              <div className="destination-card-number">{String(index+1).padStart(2,"0")}</div>
            </div>

            <div className="destination-card-body">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="destination-card-title">{destination.name}</h2>
                  <p className="destination-card-copy">{destination.summary}</p>
                </div>
                <span className="destination-card-arrow" aria-hidden="true">↗</span>
              </div>

              <div className="destination-card-meta-row">
                <span className="destination-rating">
                  <b>★</b>
                  {destination.review_count>0 ? `${destination.review_count} reviews` : "No reviews yet"}
                </span>
                <span>Best · {destination.best_time}</span>
              </div>
            </div>
          </a>;
        })}
      </div>
    </section>
  </main>;
}
