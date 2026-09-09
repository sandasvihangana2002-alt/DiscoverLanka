import { notFound } from "next/navigation";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

type Destination = {
  id: string;
  slug: string;
  name: string;
  region: string;
  summary: string;
  description: string;
  latitude: number;
  longitude: number;
  best_time: string;
};

const destinationImages: Record<string, string> = {
  kandy: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=2200&q=85",
  ella: "https://images.unsplash.com/photo-1586613837427-44f7a0b1e5e6?auto=format&fit=crop&w=2200&q=85",
  galle: "https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=2200&q=85",
  sigiriya: "https://images.unsplash.com/photo-1588598198321-9735fd5246b8?auto=format&fit=crop&w=2200&q=85",
  yala: "https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=2200&q=85",
  mirissa: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=2200&q=85",
  "nuwara-eliya": "https://images.unsplash.com/photo-1590123221594-8c5d2c5f3f44?auto=format&fit=crop&w=2200&q=85",
  anuradhapura: "https://images.unsplash.com/photo-1588258524675-c7f1e3e8d5d8?auto=format&fit=crop&w=2200&q=85",
};

async function getDestination(slug: string) {
  if (!process.env.DATABASE_URL) return null;
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql<Destination[]>`
    SELECT id, slug, name, region, summary, description, latitude, longitude, best_time
    FROM destinations
    WHERE slug = ${slug}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let destination: Destination | null = null;

  try {
    destination = await getDestination(slug);
  } catch {
    destination = null;
  }

  if (!destination) notFound();

  const image = destinationImages[destination.slug] ?? destinationImages.kandy;

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#10251f]">
      <header className="absolute left-0 top-0 z-20 w-full text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="text-xl font-bold tracking-tight">Discover<span className="text-[#e7c36e]">Lanka</span></a>
          <a href="/" className="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold backdrop-blur-sm">← Back to Discover</a>
        </div>
      </header>

      <section className="relative flex min-h-[620px] items-end overflow-hidden text-white">
        <img src={image} alt={destination.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10251f] via-black/25 to-black/10" />
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-40">
          <p className="text-sm font-bold uppercase tracking-[.25em] text-[#e7c36e]">{destination.region}</p>
          <h1 className="mt-4 text-6xl font-semibold tracking-[-.04em] md:text-8xl">{destination.name}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">{destination.summary}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[1fr_320px]">
        <article>
          <p className="text-sm font-bold uppercase tracking-[.2em] text-[#b27c1d]">About the destination</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">A place worth taking your time with.</h2>
          <p className="mt-7 whitespace-pre-line text-lg leading-8 text-[#66756f]">{destination.description}</p>
        </article>

        <aside className="h-fit rounded-3xl bg-[#e9e2d3] p-7">
          <h3 className="text-xl font-semibold">Plan your visit</h3>
          <div className="mt-7 space-y-6">
            <div><p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">Best time</p><p className="mt-1 font-medium">{destination.best_time}</p></div>
            <div><p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">Region</p><p className="mt-1 font-medium">{destination.region}</p></div>
            <div><p className="text-xs font-bold uppercase tracking-widest text-[#8d651d]">Coordinates</p><p className="mt-1 font-medium">{destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}</p></div>
          </div>
          <a href="/#plan" className="mt-8 block rounded-full bg-[#183d32] px-6 py-3 text-center font-bold text-white">Build My Trip →</a>
        </aside>
      </section>
    </main>
  );
}
