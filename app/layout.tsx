import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://discover-lanka.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "DiscoverLanka | Sri Lanka Travel Guide & Trip Planner",
  description: "Discover Sri Lanka. Plan Your Journey. Explore destinations, experiences and stories, then build a trip around your interests, time and budget.",
  applicationName: "DiscoverLanka",
  keywords: ["Sri Lanka travel", "Sri Lanka travel guide", "Sri Lanka trip planner", "Sri Lanka destinations", "Sri Lanka experiences"],
  openGraph: { title: "DiscoverLanka | Sri Lanka Travel Guide & Trip Planner", description: "Discover Sri Lanka. Plan Your Journey.", url: siteUrl, siteName: "DiscoverLanka", locale: "en_LK", type: "website" },
  twitter: { card: "summary_large_image", title: "DiscoverLanka | Sri Lanka Travel Guide & Trip Planner", description: "Discover Sri Lanka. Plan Your Journey." },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#08130f" };

const luxuryCss = `
:root{--lx-bg:#07120f;--lx-panel:rgba(12,31,25,.58);--lx-panel-strong:rgba(8,22,17,.82);--lx-ivory:#f4efe6;--lx-muted:rgba(244,239,230,.58);--lx-line:rgba(255,255,255,.11);--lx-gold:#d8b875}
html{background:var(--lx-bg)}
body.luxury-site{min-height:100vh;background:radial-gradient(circle at 15% 10%,rgba(216,184,117,.08),transparent 26%),radial-gradient(circle at 86% 14%,rgba(40,100,80,.16),transparent 30%),linear-gradient(180deg,#07120f 0%,#091713 52%,#07120f 100%);color:var(--lx-ivory)}
body.luxury-site main{background:transparent!important;color:var(--lx-ivory)!important}
body.luxury-site main>section{background-color:transparent!important;color:var(--lx-ivory)!important}
body.luxury-site a{color:inherit}
body.luxury-site [class~="bg-white"],body.luxury-site [class*="bg-white/"],body.luxury-site [class*="bg-[#f7f5ef]"],body.luxury-site [class*="bg-[#f6f2e9]"],body.luxury-site [class*="bg-[#e9e2d3]"],body.luxury-site [class*="bg-[#e8e0d0]"],body.luxury-site [class*="bg-[#eeeadf]"],body.luxury-site [class*="bg-[#f1eee6]"]{background:linear-gradient(145deg,rgba(255,255,255,.085),rgba(255,255,255,.03))!important;color:var(--lx-ivory)!important;border-color:var(--lx-line)!important;box-shadow:0 24px 75px rgba(0,0,0,.19),inset 0 1px 0 rgba(255,255,255,.045)!important;backdrop-filter:blur(22px) saturate(125%);-webkit-backdrop-filter:blur(22px) saturate(125%)}
body.luxury-site [class*="bg-[#16382f]"],body.luxury-site [class*="bg-[#183d32]"],body.luxury-site [class*="bg-[#0c261f]"],body.luxury-site [class*="bg-[#10251f]"]{background:linear-gradient(145deg,rgba(18,53,43,.78),rgba(6,19,15,.72))!important}
body.luxury-site [class*="text-[#10251f]"],body.luxury-site [class*="text-[#183d32]"],body.luxury-site [class*="text-[#16382f]"]{color:var(--lx-ivory)!important}
body.luxury-site [class*="text-[#66756f]"]{color:var(--lx-muted)!important}
body.luxury-site [class*="text-[#8d651d]"],body.luxury-site [class*="text-[#8d7447]"],body.luxury-site [class*="text-[#b27c1d]"],body.luxury-site [class*="text-[#d9a441]"],body.luxury-site [class*="text-[#c7a66a]"],body.luxury-site [class*="text-[#e7c98b]"],body.luxury-site [class*="text-[#e7c36e]"]{color:var(--lx-gold)!important}
body.luxury-site input,body.luxury-site textarea,body.luxury-site select{background:rgba(255,255,255,.045)!important;color:var(--lx-ivory)!important;border-color:rgba(255,255,255,.13)!important;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
body.luxury-site input::placeholder,body.luxury-site textarea::placeholder{color:rgba(244,239,230,.38)}
body.luxury-site header>div,body.luxury-site .backdrop-blur-md,body.luxury-site .backdrop-blur-xl{border-color:rgba(255,255,255,.12)!important;backdrop-filter:blur(20px) saturate(120%);-webkit-backdrop-filter:blur(20px) saturate(120%)}
body.luxury-site .premium-card,body.luxury-site main article{border-color:var(--lx-line)!important;background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025))!important;color:var(--lx-ivory)!important;box-shadow:0 24px 72px rgba(0,0,0,.17),inset 0 1px 0 rgba(255,255,255,.04)!important;backdrop-filter:blur(22px) saturate(125%);-webkit-backdrop-filter:blur(22px) saturate(125%)}
body.luxury-site .premium-card:hover,body.luxury-site main article:hover{transform:translateY(-3px);box-shadow:0 32px 90px rgba(0,0,0,.26),inset 0 1px 0 rgba(255,255,255,.065)!important}
body.luxury-site .premium-button-dark{background:rgba(255,255,255,.045)!important;color:var(--lx-ivory)!important;border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(14px)}
body.luxury-site .premium-button-gold{background:linear-gradient(135deg,#c7a66a,#e3c991)!important;color:#0b1712!important;box-shadow:0 18px 45px rgba(216,184,117,.17)}
body.luxury-site .premium-button-ghost{background:rgba(255,255,255,.035)!important;border-color:rgba(255,255,255,.22)!important;backdrop-filter:blur(14px)}
body.luxury-site #top{background:#07120f!important}
body.luxury-site #top>div:first-child{filter:saturate(.9) contrast(1.04)}
body.luxury-site [class*="border-black/10"],body.luxury-site [class*="border-black/5"]{border-color:var(--lx-line)!important}
body.luxury-site .hero-grid{opacity:.22}
@media(max-width:640px){body.luxury-site{overflow-x:hidden}body.luxury-site main>section{scroll-margin-top:90px}}
@media(prefers-reduced-motion:reduce){body.luxury-site *,body.luxury-site *::before,body.luxury-site *::after{transition:none!important;animation:none!important}}
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="antialiased luxury-site"><style dangerouslySetInnerHTML={{ __html: luxuryCss }} />{children}</body></html>;
}
