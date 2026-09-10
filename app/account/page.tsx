import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { getServerAuth } from "@/lib/auth/server";
import TripManager from "@/components/TripManager";

export const dynamic="force-dynamic";

type Trip={
  id:string;title:string;start_date:string|null;end_date:string|null;budget:number|null;currency:string;status:string;
  data:{days?:number;travelers?:number;interest?:string;budgetLevel?:string;selectedSlugs?:string[];itinerary?:unknown[];events?:unknown[]};updated_at:string;
};

export default async function AccountPage(){
  const auth=getServerAuth();
  if(!auth)redirect("/auth/sign-in");
  const {data:session}=await auth.getSession();
  if(!session?.user)redirect("/auth/sign-in");

  let trips:Trip[]=[];
  if(process.env.DATABASE_URL&&session.user.email){
    const sql=neon(process.env.DATABASE_URL);
    const user=await sql`SELECT id FROM users WHERE email=${session.user.email} LIMIT 1`;
    if(user.length) trips=await sql`
      SELECT id,title,start_date,end_date,budget,currency,status,data,updated_at
      FROM trips WHERE user_id=${user[0].id} ORDER BY updated_at DESC LIMIT 50
    ` as Trip[];
  }

  const active=trips.filter(t=>t.status==="planned"||t.status==="draft").length;
  const completed=trips.filter(t=>t.status==="completed").length;
  const upcoming=trips.filter(t=>t.start_date).sort((a,b)=>String(a.start_date).localeCompare(String(b.start_date)))[0]?.start_date;
  const upcomingLabel=upcoming?new Date(`${upcoming}T12:00:00`).toLocaleDateString("en-LK",{dateStyle:"medium"}):"No date set";

  return <main className="min-h-screen px-5 pb-24 pt-28 sm:px-8"><div className="mx-auto max-w-7xl">
    <header className="route-hero-panel p-7 sm:p-10"><div className="flex flex-wrap items-end justify-between gap-6"><div><p className="luxury-section-eyebrow">Private travel space</p><h1 className="luxury-display-small mt-3 text-5xl md:text-7xl">Welcome, {session.user.name||"traveller"}.</h1><p className="mt-5 max-w-2xl text-white/60">Your journeys, saved places and concierge preferences live here — ready to refine whenever you return.</p></div><form action="/api/auth/sign-out" method="post"><button className="min-h-11 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-[.15em]">Sign out</button></form></div></header>
    <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[["Cloud journeys",trips.length], ["Active / drafts",active], ["Completed",completed], ["Next departure",upcomingLabel]].map(([label,value])=><div key={String(label)} className="luxury-step-card p-6"><p className="luxury-section-eyebrow">{label}</p><p className={`${label==="Next departure"?"mt-3 text-lg font-semibold":"mt-2 font-serif text-4xl"}`}>{value}</p></div>)}
    </section>
    <section className="mt-6 luxury-step-card p-6 sm:p-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="luxury-section-eyebrow">Journey management</p><h2 className="mt-2 font-serif text-4xl">Your saved dossiers.</h2><p className="mt-2 text-sm text-white/45">Rename, duplicate, complete or remove trips without rebuilding them from scratch.</p></div><div className="flex flex-wrap gap-3"><a href="/my-trip" className="rounded-full border border-white/10 px-5 py-3 text-xs font-bold">Open My Trip ↗</a><a href="/concierge" className="rounded-full bg-[#d8b875] px-5 py-3 text-xs font-bold text-[#09140f]">New journey ↗</a></div></div><div className="mt-7"><TripManager trips={trips}/></div></section>
  </div></main>;
}
