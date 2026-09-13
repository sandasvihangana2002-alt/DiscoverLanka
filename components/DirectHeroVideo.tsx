"use client";

import { useEffect } from "react";

const HERO_VIDEO_PATH = "/hero/srilankantravel.mp4";

export default function DirectHeroVideo() {
  useEffect(() => {
    const apply = () => {
      const hero = document.querySelector<HTMLElement>(".luxury-hero");
      if (!hero) return;

      hero.querySelectorAll<HTMLVideoElement>("video:not([data-direct-hero-video])").forEach((video) => video.remove());
      hero.querySelectorAll<HTMLElement>("div.bg-cover.bg-center").forEach((layer) => { layer.style.display = "none"; });

      const grid = hero.querySelector<HTMLElement>(".hero-glass-panel > div.grid");
      if (grid?.lastElementChild) grid.lastElementChild.remove();
      hero.querySelectorAll<HTMLElement>(".absolute.bottom-5.left-5").forEach((credit) => credit.remove());

      let style = document.getElementById("discoverlanka-hero-video-style") as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement("style");
        style.id = "discoverlanka-hero-video-style";
        style.textContent = `
          .luxury-home .luxury-hero { position: relative !important; overflow: hidden !important; }
          .luxury-home .luxury-hero::after { display:none !important; }
          .luxury-home .luxury-hero .hero-glass-panel,
          .luxury-home .luxury-hero .hero-glass-panel::before,
          .luxury-home .luxury-hero .hero-glass-panel::after { background:transparent !important; border:0 !important; box-shadow:none !important; backdrop-filter:none !important; padding:0 !important; }
          .luxury-home .luxury-hero .luxury-display { text-shadow:0 10px 32px rgba(0,0,0,.28) !important; }
          .luxury-home .luxury-hero [data-direct-hero-video] { transform:rotate(90deg) scale(1.34) !important; transform-origin:center center !important; }
        `;
        document.head.appendChild(style);
      }

      let video = hero.querySelector<HTMLVideoElement>("[data-direct-hero-video]");
      if (!video) {
        video = document.createElement("video");
        video.dataset.directHeroVideo = "true";
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.defaultMuted = true;
        video.volume = 0;
        video.playsInline = true;
        video.preload = "auto";
        video.setAttribute("aria-hidden", "true");
        video.tabIndex = -1;
        video.src = HERO_VIDEO_PATH;
        Object.assign(video.style, {
          position: "absolute",
          inset: "0",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
          zIndex: "0",
          pointerEvents: "none",
          filter: "saturate(1.06) contrast(1.04) brightness(.86)",
        });
        hero.prepend(video);
      }

      const content = hero.querySelector<HTMLElement>(":scope > div.relative");
      if (content) content.style.zIndex = "2";
      void video.play().catch(() => {});
    };

    const frame = requestAnimationFrame(apply);
    const retry = window.setTimeout(apply, 500);
    const lateRetry = window.setTimeout(apply, 1500);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(retry);
      window.clearTimeout(lateRetry);
    };
  }, []);

  return null;
}
