"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("DiscoverLanka route error", error);
  }, [error]);

  return (
    <main className="min-h-screen grid place-items-center bg-[#07120f] px-5 py-20 text-[#f4efe6]">
      <section className="route-hero-panel max-w-xl p-9 text-center">
        <p className="luxury-section-eyebrow">Something went off route</p>
        <h1 className="mt-3 font-serif text-5xl sm:text-6xl">Let&apos;s get you back to the island.</h1>
        <p className="mt-4 text-white/55">The page could not load correctly. You can retry it or return to DiscoverLanka.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button onClick={() => reset()} className="rounded-full bg-[#d8b875] px-6 py-3 font-bold text-[#09140f]">Try again</button>
          <a href="/" className="rounded-full border border-white/15 bg-white/5 px-6 py-3 font-bold text-white/80">Return home</a>
        </div>
      </section>
    </main>
  );
}
