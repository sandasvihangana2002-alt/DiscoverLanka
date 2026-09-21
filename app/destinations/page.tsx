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
    SELECT d.id,d.slug,d.name,d.region,d.summary,d.best_time,d.latitude,d.longitude,
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
  return (
    <main className="destinations-page min-h-screen bg-[#07120f] text-[#f4efe6]">
      <header className="home-nav fixed inset-x-0 top-0 z-50 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-[#d9b972]/25 bg-[#07140f]/52 px-5 py-3.5 text-white shadow-[0_18px_60px_rgba(0,0,0,.24)] backdrop-blur-2xl sm:px-7">
          <a href="/" className="home-brand group flex items-center gap-2.5" aria-label="DiscoverLanka home"><span className="font-serif text-xl tracking-[-.03em] sm:text-2xl">Discover<span className="text-[#d9b972]">Lanka</span></span></a>
          <nav className="hidden items-center gap-8 text-[10px] font-black uppercase tracking-[.17em] text-white/70 lg:flex" aria-label="Primary navigation">
            <a className="home-nav-link" href="/">Discover</a><a className="home-nav-link" href="/destinations">Destinations</a><a className="home-nav-link" href="/experiences">Experiences</a><a className="home-nav-link" href="/stories">Stories</a><a className="home-nav-link" href="/plan">Plan</a><a className="home-nav-link" href="/#map">Map</a><a className="home-nav-link" href="/my-trip">My Trip</a>
          </nav>
          <div className="flex items-center gap-2"><a href="/search" className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm sm:inline-flex" aria-label="Search">⌕</a><a href="/plan" className="home-trip-cta hidden rounded-full bg-[#e3bd78] px-5 py-3 text-[11px] font-black uppercase tracking-[.12em] text-[#102018] sm:inline-flex">Build My Trip ↗</a><a href="/plan" className="inline-flex h-10 items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 text-[10px] font-black uppercase tracking-[.13em] text-white/80 lg:hidden">Plan ↗</a></div>
        </div>
        <div className="home-nav-ornament" aria-hidden="true"><span>◆</span><i></i><span>◆</span></div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-12 pt-28 sm:px-8 md:pt-36">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-4xl"><p className="destinations-eyebrow luxury-section-eyebrow">Discover Sri Lanka</p><h1 className="destinations-main-heading luxury-display-small mt-5 text-6xl md:text-8xl">Find a place worth remembering.</h1><p className="destinations-intro mt-7 max-w-2xl text-base leading-8 text-white/60 md:text-lg">Explore coastlines, ancient cities, mountain escapes and wild landscapes — each destination with its own rhythm.</p></div>
          <div className="shrink-0 rounded-full border border-white/10 bg-white/[.045] px-5 py-3 text-center backdrop-blur-xl"><span className="block text-2xl font-semibold text-[#e4c681]">{destinations.length}</span><span className="text-[9px] font-black uppercase tracking-[.2em] text-white/45">Destinations</span></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-5"><div><p className="destinations-card-meta luxury-section-eyebrow">The destination collection</p><h2 className="mt-2 font-serif text-3xl tracking-tight text-white sm:text-4xl">Places to explore</h2></div><span className="hidden text-xs text-white/35 sm:block">Scroll the collection ↓</span></div>
        <div className="destination-card-grid">
          {destinations.map((destination,index)=>{
            const image=images[destination.slug]??fallbackImage(destination.slug,index);
            return <a key={destination.id} href={`/destinations/${destination.slug}`} className="destination-travel-card group">
              <div className="destination-card-image-wrap"><img src={image} alt={destination.name} className="destination-card-image" loading={index<4?"eager":"lazy"} /><div className="destination-card-image-shade"/><div className="destination-card-top"><span>{destination.region}</span><span className="destination-heart" aria-hidden="true">♡</span></div><div className="destination-card-number">{String(index+1).padStart(2,"0")}</div></div>
              <div className="destination-card-body"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="destination-card-title">{destination.name}</h2><p className="destination-card-copy">{destination.summary}</p></div><span className="destination-card-arrow" aria-hidden="true">↗</span></div><div className="destination-card-meta-row"><span className="destination-rating"><b>★</b>{destination.review_count>0?`${destination.review_count} reviews`:"No reviews yet"}</span><span>Best · {destination.best_time}</span></div></div>
            </a>;
          })}
        </div>
      </section>

      <style>{`
.destination-card-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:22px;align-items:start}
.destination-travel-card{position:relative;display:block;overflow:hidden;border:1px solid rgba(255,255,255,.09);border-radius:28px;background:#f5f0e6;color:#10251f;box-shadow:0 20px 55px rgba(0,0,0,.20);transition:transform .38s cubic-bezier(.2,.8,.2,1),box-shadow .38s ease,border-color .3s ease}
.destination-travel-card:hover{transform:translateY(-8px);box-shadow:0 34px 80px rgba(0,0,0,.30);border-color:rgba(216,184,117,.42)}
.destination-card-image-wrap{position:relative;height:360px;overflow:hidden;background:#16382f}
.destination-card-image{width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.2,.75,.2,1),filter .5s ease}
.destination-travel-card:hover .destination-card-image{transform:scale(1.07);filter:saturate(1.06) contrast(1.03)}
.destination-card-image-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,10,7,.34),transparent 45%,rgba(3,10,7,.62))}
.destination-card-top{position:absolute;inset:16px 16px auto;display:flex;align-items:center;justify-content:space-between;color:#fff;font:800 9px/1 Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase}
.destination-card-top>span:first-child{padding:8px 10px;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:rgba(7,18,14,.34);backdrop-filter:blur(12px)}
.destination-heart{display:flex;width:36px;height:36px;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.22);border-radius:50%;background:rgba(7,18,14,.34);font-size:20px;line-height:1;backdrop-filter:blur(12px);transition:background .25s ease,transform .25s ease}
.destination-travel-card:hover .destination-heart{background:rgba(216,184,117,.18);transform:scale(1.06)}
.destination-card-number{position:absolute;right:17px;bottom:15px;color:rgba(255,255,255,.58);font:700 10px/1 Inter,system-ui,sans-serif;letter-spacing:.16em}
.destination-card-body{position:relative;margin:-24px 14px 14px;padding:25px 22px 18px;border-radius:22px;background:linear-gradient(145deg,#fbf8f1,#eee7d9);box-shadow:0 12px 30px rgba(0,0,0,.12);z-index:2}
.destination-card-title{margin:0;color:#10251f !important;font-family:"amoera","Amoera",sans-serif !important;font-size:clamp(2rem,1.5rem + 1vw,2.7rem);font-weight:700;letter-spacing:-.018em;line-height:.94}
.destination-card-copy{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;margin:9px 0 0;color:#607169;font-family:"Cormorant","Cormorant Garamond",Georgia,serif;font-size:1.08rem;line-height:1.42}
.destination-card-arrow{display:flex;width:34px;height:34px;flex:0 0 auto;align-items:center;justify-content:center;border:1px solid rgba(16,37,31,.12);border-radius:50%;color:#17382d;font:600 16px/1 Inter,system-ui,sans-serif;transition:transform .25s ease,background .25s ease}
.destination-travel-card:hover .destination-card-arrow{transform:translate(2px,-2px);background:rgba(216,184,117,.16)}
.destination-card-meta-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:16px;padding-top:12px;border-top:1px solid rgba(16,37,31,.10);color:#718078;font:800 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.09em;text-transform:uppercase}
.destination-rating{display:inline-flex;align-items:center;gap:5px;color:#66766d}
.destination-rating b{color:#bd8f36;font-size:11px}

@media(max-width:1100px){
  .destination-card-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media(max-width:820px){
  .destination-card-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
  .destination-card-image-wrap{height:320px}
}
@media(max-width:560px){
  .destination-card-grid{grid-template-columns:1fr;gap:18px}
  .destination-card-image-wrap{height:300px}
  .destination-card-body{margin:-20px 9px 9px;padding:22px 19px 17px}
}
`}</style>
    </main>
  );
}
