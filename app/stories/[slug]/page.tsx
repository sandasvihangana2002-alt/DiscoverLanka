import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

type Story = { id: string; slug: string; title: string; excerpt: string; content: string; category: string; published_at: string | null };

async function getStory(slug: string) {
  if (!process.env.DATABASE_URL) return null;
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`SELECT id, slug, title, excerpt, content, category, published_at FROM articles WHERE slug = ${slug} LIMIT 1`;
  return (rows[0] as Story | undefined) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStory(slug).catch(() => null);
  if (!story) return { title: "Story not found | DiscoverLanka" };
  const description = story.excerpt || `Read ${story.title} on DiscoverLanka.`;
  return { title: `${story.title} | DiscoverLanka`, description, alternates: { canonical: `/stories/${story.slug}` }, openGraph: { title: `${story.title} | DiscoverLanka`, description, type: "article" }, twitter: { card: "summary_large_image", title: `${story.title} | DiscoverLanka`, description } };
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let story: Story | null = null;
  try { story = await getStory(slug); } catch { story = null; }
  if (!story) notFound();
  return <main className="min-h-screen bg-[#f7f5ef] text-[#10251f]"><header className="border-b border-black/10"><div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5"><a href="/" className="text-xl font-bold">Discover<span className="text-[#d9a441]">Lanka</span></a><a href="/stories" className="text-sm font-semibold text-[#66756f]">← All stories</a></div></header><article className="mx-auto max-w-3xl px-6 py-16 md:py-24"><p className="text-sm font-bold uppercase tracking-[.2em] text-[#b27c1d]">{story.category || "Sri Lanka"}</p><h1 className="mt-4 text-5xl font-semibold tracking-[-.04em] md:text-7xl">{story.title}</h1>{story.excerpt && <p className="mt-7 text-xl leading-8 text-[#66756f]">{story.excerpt}</p>}<div className="mt-12 border-t border-black/10 pt-10 whitespace-pre-line text-lg leading-9 text-[#31453f]">{story.content}</div><a href="/plan" className="mt-12 inline-block rounded-full bg-[#183d32] px-7 py-3.5 font-bold text-white">Build my trip →</a></article></main>;
}
