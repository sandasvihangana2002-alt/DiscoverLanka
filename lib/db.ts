import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Keep the shared helper's type identical to the official Neon HTTP query function.
// The previous hand-written function type stripped Neon-specific helpers such as
// transaction/query options and caused TypeScript failures across the API routes.
export type SqlTag = NeonQueryFunction<false, false>;

export function getSql(): SqlTag | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  return neon(url);
}
