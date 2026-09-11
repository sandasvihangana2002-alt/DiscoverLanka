import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sri Lanka Travel Stories",
  description: "Read DiscoverLanka stories about Sri Lanka's places, culture, food, seasons and slower ways to travel.",
  alternates: { canonical: "/stories" },
  openGraph: {
    title: "Sri Lanka Travel Stories | DiscoverLanka",
    description: "Go beyond the guidebook with thoughtful Sri Lanka travel stories and local perspectives.",
    url: "/stories",
    type: "website",
  },
};

export default function StoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
