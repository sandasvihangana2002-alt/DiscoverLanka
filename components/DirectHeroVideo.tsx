"use client";

import { useEffect } from "react";

const HERO_VIDEO_PATH = "/hero/srilankantravel.mp4";
const HERO_STYLE_ID = "discoverlanka-hero-clean-style";

export default function DirectHeroVideo() {
  useEffect(() => {
    const apply = () => {
      const hero = document.querySelector<HTMLElement>(".luxury-hero");
      if (!hero) return;

      // Remove any legacy video/image layers and all hero fade/overlay layers.
      hero.querySelectorAll<HTMLVideoElement>("video:not([data-direct-hero-video])").forEach((video) => video.remove());
      hero.querySelectorAll<HTMLElement>(":scope > div.absolute").forEach((layer) => layer.remove());
      hero.querySelectorAll<HTMLElement>(".absolute.bottom-5.left-5").forEach((credit) => credit.remove());

      // Remove the decorative cards on the right; leave typography only.
      const grid = hero.querySelector<HTMLElement>(".hero-glass-panel > div.grid");
      if (grid) {
        const visualColumn = grid.lastElementChild as HTMLElement | null;
        if (visualColumn) visualColumn.remove();
        grid.style.display = "block";
      }

      // Override global hero styling so no translucent panel or cinematic fade remains.
      let style = document.getElementById(HERO_STYLE_ID) as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement("style");
        style.id = HERO_STYLE_ID;
        style.textContent = `
          body.luxury-site .luxury-home .luxury-hero::after { display:none !important; content:none !important; background:none !important; }
          body.luxury-site .luxury-home .hero-glass-panel,
          body.luxury-site .luxury-home .hero-glass-panel::before,
          body.luxury-site .luxury-home .hero-glass-panel::after {
            background:transparent !important;
            border:0 !important;
            box-shadow:none !important;
            backdrop-filter:none !important;
            -webkit-backdrop-filter:none !important;
            content:none !important;
          }
          body.luxury-site .luxury-home .hero-glass-panel > div.grid { background:transparent !important; }
          body.luxury-site .luxury-home .luxury-display { text-shadow:0 5px 24px rgba(0,0,0,.18) !important; }
          body.luxury-site .luxury-home .luxury-display::after { opacity:.85 !important; }
        `;
        document.head.appendChild(style);
      }

      const panel = hero.querySelector<HTMLElement>(".hero-glass-panel");
      if (panel) {
        panel.style.background = "transparent";
        panel.style.border = "0";
        panel.style.boxShadow = "none";
        panel.style.backdropFilter = "none";
        panel.style.padding = "0";
        panel.style.borderRadius = "0";
      }

      const existing = hero.querySelector<HTMLVideoElement>("video[data-direct-hero-video]");
      if (existing) {
        existing.play().catch(() => {});
        return;
      }

      const video = document.createElement("video");
      video.dataset.directHeroVideo = "true";
      video.src = HERO_VIDEO_PATH;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
      video.playsInline = true;
      video.preload = "auto";
      video.setAttribute("aria-hidden", "true");
      video.setAttribute("tabindex", "-1");

      Object.assign(video.style, {
        position: "absolute",
        left: "50%",
        top: "50%",
        width: "100svh",
        height: "100vw",
        maxWidth: "none",
        maxHeight: "none",
        objectFit: "cover",
        objectPosition: "center center",
        transform: "translate(-50%, -50%) rotate(-90deg) scale(1.015)",
        transformOrigin: "center center",
        zIndex: "0",
        pointerEvents: "none",
        filter: "saturate(1.05) contrast(1.03) brightness(.98)",
      });

      hero.prepend(video);

      Array.from(hero.children).forEach((node) => {
        if (node === video) return;
        const element = node as HTMLElement;
        if (!element.style.zIndex) element.style.zIndex = "1";
      });

      const heroContent = hero.querySelector<HTMLElement>(":scope > div.relative");
      if (heroContent) heroContent.style.zIndex = "2";

      video.addEventListener("canplay", () => video.play().catch(() => {}), { once: true });
    };

    const frame = requestAnimationFrame(apply);
    const retry = window.setTimeout(apply, 500);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(retry);
    };
  }, []);

  return null;
}
