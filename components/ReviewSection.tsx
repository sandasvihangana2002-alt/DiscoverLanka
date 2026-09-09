"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Review = { id: string; rating: number; title: string | null; content: string | null; created_at: string };
type Props = { experienceId?: string; destinationId?: string; experienceName?: string; destinationName?: string };

export default function ReviewSection({ experienceId, destinationId, experienceName, destinationName }: Props) {
  const isDestination = Boolean(destinationId);
  const targetId = destinationId ?? experienceId ?? "";
  const targetName = destinationName ?? experienceName ?? "this place";
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  async function loadReviews() {
    try {
      const query = isDestination ? `destinationId=${encodeURIComponent(targetId)}` : `experienceId=${encodeURIComponent(targetId)}`;
      const response = await fetch(`/api/reviews?${query}`, { cache: "no-store" });
      const data = await response.json();
      setReviews(response.ok && Array.isArray(data.reviews) ? data.reviews : []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReviews(); }, [targetId, isDestination]);

  const average = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length;
  }, [reviews]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    try {
      const body = isDestination
        ? { destinationId: targetId, rating, title: title.trim(), content: content.trim() }
        : { experienceId: targetId, rating, title: title.trim(), content: content.trim() };
      const response = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Review could not be saved");
      setTitle(""); setContent(""); setRating(5); setMessage("Thanks — your review is live."); await loadReviews();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Review could not be saved.");
    } finally { setSending(false); }
  }

  return (
    <section className="border-t border-black/10 pt-14" aria-labelledby="reviews-heading">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.2em] text-[#b27c1d]">Traveler voices</p>
          <h2 id="reviews-heading" className="mt-2 text-4xl font-semibold">Reviews for {targetName}.</h2>
        </div>
        <div className="rounded-2xl bg-[#e9e2d3] px-5 py-4 text-right">
          <p className="text-2xl font-semibold">{reviews.length ? average.toFixed(1) : "—"} <span className="text-[#b27c1d]">★</span></p>
          <p className="text-xs text-[#66756f]">{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</p>
        </div>
      </div>
      <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {loading ? <div className="rounded-3xl bg-[#f1eee6] p-7 text-[#66756f]">Loading reviews…</div> : reviews.length ? (
            <div className="space-y-4">{reviews.map(review => <article key={review.id} className="rounded-3xl bg-[#f1eee6] p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div className="text-[#b27c1d]">{"★".repeat(review.rating)}<span className="text-black/10">{"★".repeat(5-review.rating)}</span></div><time className="text-xs text-[#66756f]" dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString("en-LK", { dateStyle: "medium" })}</time></div>{review.title && <h3 className="mt-4 text-xl font-semibold">{review.title}</h3>}{review.content && <p className="mt-2 whitespace-pre-line leading-7 text-[#66756f]">{review.content}</p>}</article>)}</div>
          ) : <div className="rounded-3xl bg-[#f1eee6] p-8 text-[#66756f]">No reviews yet. Be the first traveler to share your experience.</div>}
        </div>
        <form onSubmit={submit} className="h-fit rounded-3xl bg-white p-7 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-[#8d651d]">Share your experience</p><h3 className="mt-2 text-2xl font-semibold">How was it?</h3>
          <label className="mt-6 block text-sm font-semibold">Rating<div className="mt-3 flex gap-1" aria-label="Choose rating from 1 to 5 stars">{[1,2,3,4,5].map(value => <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} star${value>1?"s":""}`} className={`text-2xl ${value<=rating?"text-[#b27c1d]":"text-black/15"}`}>★</button>)}</div></label>
          <label className="mt-6 block text-sm font-semibold">Title<input value={title} onChange={e=>setTitle(e.target.value)} maxLength={120} className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 font-normal outline-none focus:border-[#183d32]" placeholder="A memorable day" /></label>
          <label className="mt-4 block text-sm font-semibold">Review<textarea value={content} onChange={e=>setContent(e.target.value)} maxLength={1200} rows={5} className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 font-normal outline-none focus:border-[#183d32]" placeholder="What should another traveler know?" /></label>
          <button disabled={sending} className="mt-5 w-full rounded-full bg-[#183d32] px-6 py-3.5 font-bold text-white disabled:opacity-50">{sending?"Publishing…":"Publish review →"}</button>
          {message && <p className="mt-3 text-sm text-[#66756f]" aria-live="polite">{message}</p>}
          <p className="mt-4 text-xs leading-5 text-[#8a948f]">Reviews are published with your rating and optional text. No account is required in this MVP.</p>
        </form>
      </div>
    </section>
  );
}
