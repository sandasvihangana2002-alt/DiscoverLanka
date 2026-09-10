import { neon } from "@neondatabase/serverless";

// Use the exact return type produced by the Neon driver so the API routes
// retain Neon-specific query helpers such as transaction().
export type SqlTag = ReturnType<typeof neon>;

export function getSql(): SqlTag | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  return neon(url);
}
