import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DiscoverLanka | Sri Lanka Travel Guide & Trip Planner",
  description: "Discover Sri Lanka. Plan Your Journey.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
