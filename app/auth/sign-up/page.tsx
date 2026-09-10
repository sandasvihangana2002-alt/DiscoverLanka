"use client";

import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth/client";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const result = await authClient.signUp.email({ name: name.trim(), email, password });
    setLoading(false);
    if (result.error) {
      setError(result.error.message || "Could not create your account.");
      return;
    }
    window.location.href = "/my-trip";
  }

  return (
    <main className="min-h-screen px-5 py-20 sm:px-8">
      <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center">
        <section className="luxury-glass w-full max-w-xl rounded-[30px] p-7 sm:p-10">
          <a href="/" className="text-lg font-bold tracking-tight">Discover<span className="text-[#d8b875]">Lanka</span></a>
          <p className="mt-10 luxury-section-eyebrow">Keep the journey with you</p>
          <h1 className="luxury-display-small mt-3 text-5xl">Create your account.</h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/60">Save routes, keep your favourite places and return to your DiscoverLanka journey from any device.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block text-sm text-white/65">Name<input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" /></label>
            <label className="block text-sm text-white/65">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" /></label>
            <label className="block text-sm text-white/65">Password<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" /></label>
            {error && <p className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">{error}</p>}
            <button disabled={loading} className="w-full rounded-full bg-[#d8b875] px-6 py-3.5 font-bold text-[#09140f] disabled:opacity-60">{loading ? "Creating your journey space…" : "Create account"}</button>
          </form>
          <p className="mt-6 text-sm text-white/55">Already have an account? <a href="/auth/sign-in" className="font-semibold text-[#d8b875]">Sign in →</a></p>
        </section>
      </div>
    </main>
  );
}
