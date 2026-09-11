import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sri Lanka Trip Planner",
  description: "Build a Sri Lanka trip around your interests, available days, travel pace and budget with DiscoverLanka.",
  alternates: { canonical: "/plan" },
  openGraph: {
    title: "Sri Lanka Trip Planner | DiscoverLanka",
    description: "Build a thoughtful Sri Lanka itinerary around your time, interests and travel style.",
    url: "/plan",
    type: "website",
  },
};

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
