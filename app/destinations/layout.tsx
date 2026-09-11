import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sri Lanka Destinations",
  description: "Explore curated Sri Lanka destinations, from hill country and heritage cities to wildlife landscapes and east and south coast escapes.",
  alternates: { canonical: "/destinations" },
  openGraph: {
    title: "Sri Lanka Destinations | DiscoverLanka",
    description: "Explore curated Sri Lanka destinations and build a journey around the places you want to experience.",
    url: "/destinations",
    type: "website",
  },
};

export default function DestinationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
