import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sri Lanka Experiences",
  description: "Discover curated Sri Lanka experiences across wildlife, culture, food, coast, heritage and slow travel.",
  alternates: { canonical: "/experiences" },
  openGraph: {
    title: "Sri Lanka Experiences | DiscoverLanka",
    description: "Find meaningful experiences in Sri Lanka and plan a route around what you love.",
    url: "/experiences",
    type: "website",
  },
};

export default function ExperiencesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
