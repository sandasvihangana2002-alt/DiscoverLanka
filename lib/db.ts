import { neon } from "@neondatabase/serverless";

export type SqlTag = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<Record<string, unknown>[]>;

export function getSql(): SqlTag | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  return neon(url) as unknown as SqlTag;
}
