import type { MetadataRoute } from "next";
import { neon } from "@neondatabase/serverless";

const baseUrl = "https://discover-lanka.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["", "/destinations", "/experiences", "/plan", "/concierge", "/stories", "/events", "/about", "/contact", "/privacy", "/terms"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/stories" ? "weekly" as const : "monthly" as const,
    priority: path === "" ? 1 : ["/destinations", "/plan", "/concierge"].includes(path) ? 0.85 : 0.65,
  }));

  if (!process.env.DATABASE_URL) return routes;

  try {
    const sql = neon(process.env.DATABASE_URL);
    const [destinations, experiences, stories] = await Promise.all([
      sql`SELECT slug, updated_at FROM destinations ORDER BY name`,
      sql`SELECT slug, updated_at FROM experiences ORDER BY name`,
      sql`SELECT slug, updated_at FROM articles WHERE published_at IS NULL OR published_at <= NOW() ORDER BY published_at DESC NULLS LAST`,
    ]);

    return [
      ...routes,
      ...destinations.map((item) => ({ url: `${baseUrl}/destinations/${item.slug}`, lastModified: item.updated_at ? new Date(item.updated_at) : new Date(), changeFrequency: "monthly" as const, priority: 0.8 })),
      ...experiences.map((item) => ({ url: `${baseUrl}/experiences/${item.slug}`, lastModified: item.updated_at ? new Date(item.updated_at) : new Date(), changeFrequency: "monthly" as const, priority: 0.75 })),
      ...stories.map((item) => ({ url: `${baseUrl}/stories/${item.slug}`, lastModified: item.updated_at ? new Date(item.updated_at) : new Date(), changeFrequency: "weekly" as const, priority: 0.7 })),
    ];
  } catch {
    return routes;
  }
}
