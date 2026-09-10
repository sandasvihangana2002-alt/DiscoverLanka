import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { getServerAuth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

type Trip = {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  currency: string;
  status: string;
  data: { days?: number; travelers?: number; interest?: string; budgetLevel?: string; selectedSlugs?: string[] } | null;
  updated_at: string;
};

function prettyDate(value: string | null) {
  if (!value) return "Flexible dates";
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-LK", { dateStyle: "medium" });
}

function money(value: number | null, currency = "LKR") {
  if (value == null) return "Budget not set";
  return `${currency} ${Math.round(value).toLocaleString("en-LK")}`;
}

function statusLabel(status: string) {
  return status === "planned" ? "Planned" : status === "completed" ? "Completed" : status === "archived" ? "Archived" : "Draft";
}

export default async function AccountPage() {
  const auth = getServerAuth();
  if (!auth) redirect("/auth/sign-in");

  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  let trips: Trip[] = [];
  let totalTrips = 0;
  let plannedTrips = 0;

  if (process.env.DATABASE_URL && session.user.email) {
    const sql = neon(process.env.DATABASE_URL);
    const user = await sql`SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1`;
    if (user.length) {
      trips = await sql`
        SELECT id, title, start_date, end_date, budget, currency, status, data, updated_at
        FROM trips
        WHERE user_id = ${user[0].id}
        ORDER BY updated_at DESC
        LIMIT 50
      ` as Trip[];
      const counts = await sql`
        SELECT COUNT(*)::int AS total,
               COUNT(*) FILTER (WHERE status = 'planned')::int AS planned
        FROM trips
        WHERE user_id = ${user[0].id}
      `;
      totalTrips = Number(counts[0]?.total ?? trips.length);
      plannedTrips = Number(counts[0]?.planned ?? trips.filter((trip) => trip.status === "planned").length);
    }
  }

  const recentTrips = trips.slice(0, 8);
  const nextTrip = [...trips]
    .filter((trip) => trip.start_date && new Date(`${trip.start_date}T12:00:00`).getTime() >= Date.now())
    .sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)))[0] ?? null;

  return (
    <main className="min-h-screen px-4 pb-24 pt-24 sm:px-6 md:pt-28">
      <div className="mx-auto max-w-7xl">
        <header className="route-hero-panel p-6 sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0">
              <p className="luxury-section-eyebrow">Private travel space</p>
              <h1 className="luxury-display-small mt-3 text-4xl sm:text-5xl md:text-7xl">
                Welcome, {session.user.name || "traveller"}.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                Your journeys, saved routes and travel plans live here, ready to pick up whenever you return.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="/plan" className="rounded-full bg-[#d8b875] px-5 py-3 text-xs font-bold text-[#09140f] sm:px-6 sm:py-3.5">
                Build a trip ↗
              </a>
              <form action="/api/auth/sign-out" method="post">
                <button className="rounded-full border border-white/12 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-[.15em]">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="luxury-step-card p-5 sm:p-6">
            <p className="luxury-section-eyebrow">Saved trips</p>
            <p className="mt-2 font-serif text-4xl">{totalTrips}</p>
            <p className="mt-2 text-xs text-white/40">Across your account</p>
          </div>
          <div className="luxury-step-card p-5 sm:p-6">
            <p className="luxury-section-eyebrow">Planned</p>
            <p className="mt-2 font-serif text-4xl">{plannedTrips}</p>
            <p className="mt-2 text-xs text-white/40">Journeys ready to go</p>
          </div>
          <div className="luxury-step-card p-5 sm:p-6">
            <p className="luxury-section-eyebrow">Next departure</p>
            <p className="mt-2 font-serif text-xl sm:text-2xl">{nextTrip ? prettyDate(nextTrip.start_date) : "No date yet"}</p>
            <p className="mt-2 truncate text-xs text-white/40">{nextTrip?.title || "Choose your next route"}</p>
          </div>
          <div className="luxury-step-card p-5 sm:p-6">
            <p className="luxury-section-eyebrow">Concierge</p>
            <p className="mt-2 text-sm leading-6 text-white/55">Refine a route around dates, pace, interests and budget.</p>
            <a href="/concierge" className="mt-4 inline-flex rounded-full border border-[#d8b875]/30 bg-[#d8b875]/10 px-4 py-2.5 text-xs font-bold text-[#d8b875]">
              Open concierge ↗
            </a>
          </div>
        </section>

        <section className="mt-5 luxury-step-card p-5 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="luxury-section-eyebrow">Cloud journeys</p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl">Your travel dossiers.</h2>
            </div>
            <a href="/my-trip" className="text-xs font-bold uppercase tracking-[.15em] text-white/45 hover:text-white">
              Open My Trip ↗
            </a>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {recentTrips.length ? recentTrips.map((trip) => (
              <a
                href={`/my-trip?tripId=${encodeURIComponent(trip.id)}`}
                key={trip.id}
                className="group rounded-2xl border border-white/8 bg-white/[.025] p-4 transition hover:-translate-y-0.5 hover:border-[#d8b875]/25 hover:bg-white/[.045] sm:p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold">{trip.title}</p>
                      <span className="rounded-full border border-white/8 bg-white/[.035] px-2 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-white/45">
                        {statusLabel(trip.status)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-white/40">
                      {prettyDate(trip.start_date)} → {prettyDate(trip.end_date)}
                    </p>
                  </div>
                  <span className="shrink-0 text-lg text-[#d8b875] transition group-hover:translate-x-0.5">↗</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                  <div className="rounded-xl border border-white/7 bg-black/10 p-3"><span className="block text-[9px] uppercase tracking-[.13em] text-white/35">Style</span><strong className="mt-1 block text-white/75">{trip.data?.interest || "Curated"}</strong></div>
                  <div className="rounded-xl border border-white/7 bg-black/10 p-3"><span className="block text-[9px] uppercase tracking-[.13em] text-white/35">Days</span><strong className="mt-1 block text-white/75">{trip.data?.days || "—"}</strong></div>
                  <div className="rounded-xl border border-white/7 bg-black/10 p-3"><span className="block text-[9px] uppercase tracking-[.13em] text-white/35">Travellers</span><strong className="mt-1 block text-white/75">{trip.data?.travelers || "—"}</strong></div>
                  <div className="rounded-xl border border-white/7 bg-black/10 p-3"><span className="block text-[9px] uppercase tracking-[.13em] text-white/35">Estimate</span><strong className="mt-1 block truncate text-white/75">{money(trip.budget, trip.currency)}</strong></div>
                </div>
              </a>
            )) : (
              <div className="md:col-span-2 rounded-2xl border border-dashed border-white/10 bg-white/[.02] p-8 text-center sm:p-12">
                <p className="luxury-section-eyebrow">No cloud journeys yet</p>
                <h3 className="mt-3 font-serif text-3xl">Your first dossier starts here.</h3>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/45">
                  Build a trip and it will appear here for quick access from any device after you sign in.
                </p>
                <a href="/plan" className="mt-6 inline-flex rounded-full bg-[#d8b875] px-6 py-3.5 text-sm font-bold text-[#09140f]">
                  Start planning ↗
                </a>
              </div>
            )}
          </div>

          {totalTrips > recentTrips.length && (
            <p className="mt-5 text-center text-xs text-white/35">Showing your 8 most recently updated journeys.</p>
          )}
        </section>
      </div>
    </main>
  );
}
