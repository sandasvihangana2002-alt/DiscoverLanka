import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Trip",
  description: "View and refine your saved DiscoverLanka journey.",
  alternates: { canonical: "/my-trip" },
  robots: { index: false, follow: false },
};

export default function MyTripLayout({ children }: { children: React.ReactNode }) {
  return children;
}
