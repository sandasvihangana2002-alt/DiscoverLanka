import { neon } from "@neondatabase/serverless";

export type QueryRow = Record<string, any>;
export type SqlTag = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<QueryRow[]>;

export function getSql(): SqlTag | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  const client = neon(url);
  return ((strings: TemplateStringsArray, ...values: unknown[]) =>
    client(strings, ...values) as Promise<QueryRow[]>) as SqlTag;
}
