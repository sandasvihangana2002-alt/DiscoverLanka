"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);
  async function signOut() {
    setLoading(true);
    await authClient.signOut();
    window.location.href = "/";
  }
  return <button onClick={signOut} disabled={loading} className="rounded-full border border-white/12 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-[.15em] text-white/70 disabled:opacity-50">{loading ? "Signing out…" : "Sign out"}</button>;
}
