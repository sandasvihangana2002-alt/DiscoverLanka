import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./luxury-overrides.css";
import "./luxury-motion.css";
import "./luxury-v2.css";
import "./luxury-nextlevel.css";
import LuxuryInteractions from "@/components/LuxuryInteractions";

const siteUrl = "https://discover-lanka.vercel.app";
const defaultTitle = "DiscoverLanka | Sri Lanka Travel Guide & Trip Planner";
const defaultDescription = "Discover Sri Lanka through curated destinations and stories, then build a trip around your interests, time and budget.";
const defaultOgImage = "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=1600&q=88";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: defaultTitle, template: "%s | DiscoverLanka" },
  description: defaultDescription,
  applicationName: "DiscoverLanka",
  keywords: ["Sri Lanka travel", "Sri Lanka travel guide", "Sri Lanka trip planner", "Sri Lanka destinations", "Sri Lanka itinerary"],
  alternates: { canonical: "/" },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName: "DiscoverLanka",
    locale: "en_LK",
    type: "website",
    images: [{ url: defaultOgImage, width: 1600, height: 1067, alt: "DiscoverLanka — Sri Lanka travel" }],
  },
  twitter: { card: "summary_large_image", title: defaultTitle, description: defaultDescription, images: [defaultOgImage] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#08130f" };

const luxuryCss = `
:root{--lx-bg:#07120f;--lx-panel:rgba(12,31,25,.58);--lx-panel-strong:rgba(8,22,17,.82);--lx-ivory:#f4efe6;--lx-muted:rgba(244,239,230,.68);--lx-line:rgba(255,255,255,.11);--lx-gold:#d8b875}
html{background:var(--lx-bg)}
body.luxury-site{min-height:100vh;background:radial-gradient(circle at 15% 10%,rgba(216,184,117,.08),transparent 26%),radial-gradient(circle at 86% 14%,rgba(40,100,80,.16),transparent 30%),linear-gradient(180deg,#07120f 0%,#091713 52%,#07120f 100%);color:var(--lx-ivory);overflow-x:hidden}
body.luxury-site main{background:transparent!important;color:var(--lx-ivory)!important}
body.luxury-site main>section{background-color:transparent!important;color:var(--lx-ivory)!important}
body.luxury-site a{color:inherit}
body.luxury-site h1,body.luxury-site h2,body.luxury-site h3,body.luxury-site h4{color:var(--lx-ivory)}
body.luxury-site input,body.luxury-site textarea,body.luxury-site select{background:rgba(255,255,255,.045)!important;color:var(--lx-ivory)!important;border-color:rgba(255,255,255,.13)!important}
body.luxury-site input::placeholder,body.luxury-site textarea::placeholder{color:rgba(244,239,230,.42)}
body.luxury-site header>div,body.luxury-site .backdrop-blur-md,body.luxury-site .backdrop-blur-xl{border-color:rgba(255,255,255,.12)!important;backdrop-filter:blur(20px) saturate(120%);-webkit-backdrop-filter:blur(20px) saturate(120%)}
body.luxury-site .premium-card,body.luxury-site main article{border-color:var(--lx-line)!important;background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025))!important;color:var(--lx-ivory)!important;box-shadow:0 24px 72px rgba(0,0,0,.17),inset 0 1px 0 rgba(255,255,255,.04)!important;backdrop-filter:blur(22px) saturate(125%);-webkit-backdrop-filter:blur(22px) saturate(125%)}
body.luxury-site .premium-card:hover,body.luxury-site main article:hover{transform:translateY(-3px);box-shadow:0 32px 90px rgba(0,0,0,.26),inset 0 1px 0 rgba(255,255,255,.065)!important}
body.luxury-site .premium-button-dark{background:rgba(255,255,255,.045)!important;color:var(--lx-ivory)!important;border:1px solid rgba(255,255,255,.14)}
body.luxury-site .premium-button-gold{background:linear-gradient(135deg,#c7a66a,#e3c991)!important;color:#0b1712!important;box-shadow:0 18px 45px rgba(216,184,117,.17)}
body.luxury-site .premium-button-ghost{background:rgba(255,255,255,.035)!important;border-color:rgba(255,255,255,.22)!important;color:var(--lx-ivory)!important}
body.luxury-site [class*=\"border-black/10\"],body.luxury-site [class*=\"border-black/5\"]{border-color:var(--lx-line)!important}
body.luxury-site main:not(.luxury-home) a[class*=\"rounded-full\"],body.luxury-site main:not(.luxury-home) button[class*=\"rounded-full\"]{border:1px solid rgba(255,255,255,.13);background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025))!important;color:var(--lx-ivory)!important}
body.luxury-site .text-white\/20,body.luxury-site .text-white\/25,body.luxury-site .text-white\/30,body.luxury-site .text-white\/35{color:rgba(244,239,230,.58)!important}
body.luxury-site .text-white\/40,body.luxury-site .text-white\/45,body.luxury-site .text-white\/50{color:rgba(244,239,230,.68)!important}
body.luxury-site .premium-muted{color:rgba(244,239,230,.68)!important}

/* Hero image: render the single local asset above legacy styling without changing the hero's child layout. */
body.luxury-site main.home-rebuild #top{position:relative!important;overflow:hidden!important}
body.luxury-site main.home-rebuild #top > img{display:block!important;visibility:visible!important;opacity:1!important;position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;z-index:0!important}

@media(prefers-reduced-motion:reduce){body.luxury-site *,body.luxury-site *::before,body.luxury-site *::after{transition:none!important;animation:none!important;scroll-behavior:auto!important}}
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="antialiased luxury-site"><style dangerouslySetInnerHTML={{ __html: luxuryCss }} /><LuxuryInteractions />{children}</body></html>;
}
