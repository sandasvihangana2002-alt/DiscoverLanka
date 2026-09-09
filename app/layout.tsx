import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://discover-lanka.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "DiscoverLanka | Sri Lanka Travel Guide & Trip Planner",
  description: "Discover Sri Lanka. Plan Your Journey. Explore destinations, experiences and stories, then build a trip around your interests, time and budget.",
  applicationName: "DiscoverLanka",
  keywords: ["Sri Lanka travel", "Sri Lanka travel guide", "Sri Lanka trip planner", "Sri Lanka destinations", "Sri Lanka experiences"],
  openGraph: {
    title: "DiscoverLanka | Sri Lanka Travel Guide & Trip Planner",
    description: "Discover Sri Lanka. Plan Your Journey.",
    url: siteUrl,
    siteName: "DiscoverLanka",
    locale: "en_LK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DiscoverLanka | Sri Lanka Travel Guide & Trip Planner",
    description: "Discover Sri Lanka. Plan Your Journey.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#10251f",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
