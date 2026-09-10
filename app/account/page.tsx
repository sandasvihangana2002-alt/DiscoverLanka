import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  let session: Awaited<ReturnType<typeof auth.getSession>>["data"] = null;
  try { session = (await auth.getSession()).data; } catch {}
  if (!session?.user) redirect("/auth/sign-in");

  return (
    <main className="min-h-screen px-5 pb-24 pt-28 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="route-hero-panel">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="luxury-section-eyebrow">DiscoverLanka account</p>
              <h1 className="luxury-display-small mt-3 text-5xl md:text-7xl">Welcome, {session.user.name}.</h1>
              <p className="mt-5 max-w-2xl text-white/60">Your trips, saved places and concierge preferences can now live with your account instead of one browser.</p>
            </div>
            <SignOutButton />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/my-trip" className="rounded-full bg-[#d8b875] px-6 py-3 font-bold text-[#09140f]">Open My Trip ↗</a>
            <a href="/concierge" className="rounded-full border border-white/15 bg-white/5 px-6 py-3 font-semibold">Ask the concierge</a>
          </div>
        </header>
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="luxury-step-card p-6"><p className="luxury-section-eyebrow">Profile</p><h2 className="mt-2 text-2xl font-semibold">{session.user.name}</h2><p className="mt-2 text-sm text-white/55">{session.user.email}</p></div>
          <div className="luxury-step-card p-6"><p className="luxury-section-eyebrow">Cloud workspace</p><p className="mt-2 text-sm leading-7 text-white/60">New concierge journeys are associated with this cloud identity while signed in, so the same journey can be reopened from another device.</p></div>
        </section>
      </div>
    </main>
  );
}
