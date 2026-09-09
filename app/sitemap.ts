import type { MetadataRoute } from "next";
import { neon } from "@neondatabase/serverless";

const baseUrl = "https://discover-lanka.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/experiences", "/plan", "/stories", "/events", "/my-trip"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" as const : "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  if (!process.env.DATABASE_URL) return staticRoutes;

  try {
    const sql = neon(process.env.DATABASE_URL);
    const [destinations, experiences, stories] = await Promise.all([
      sql`SELECT slug, updated_at FROM destinations ORDER BY name ASC`,
      sql`SELECT slug, updated_at FROM experiences ORDER BY name ASC`,
      sql`SELECT slug, updated_at FROM articles WHERE published_at IS NULL OR published_at <= NOW() ORDER BY published_at DESC NULLS LAST`,
    ]);

    return [
      ...staticRoutes,
      ...destinations.map((item) => ({ url: `${baseUrl}/destinations/${item.slug}`, lastModified: new Date(item.updated_at), changeFrequency: "monthly" as const, priority: 0.8 })),
      ...experiences.map((item) => ({ url: `${baseUrl}/experiences/${item.slug}`, lastModified: new Date(item.updated_at), changeFrequency: "monthly" as const, priority: 0.75 })),
      ...stories.map((item) => ({ url: `${baseUrl}/stories/${item.slug}`, lastModified: new Date(item.updated_at ?? new Date()), changeFrequency: "weekly" as const, priority: 0.7 })),
    ];
  } catch {
    return staticRoutes;
  }
}
