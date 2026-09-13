"use client";

import { useEffect } from "react";

const HERO_VIDEO_PATH = "/hero/srilankantravel.mp4";

export default function DirectHeroVideo() {
  useEffect(() => {
    const apply = () => {
      const hero = document.querySelector<HTMLElement>(".luxury-hero");
      if (!hero) return;

      const oldVideos = hero.querySelectorAll<HTMLVideoElement>("video:not([data-direct-hero-video])");
      oldVideos.forEach((video) => video.remove());

      const legacyImage = hero.querySelector<HTMLElement>("div.bg-cover.bg-center");
      if (legacyImage) legacyImage.style.display = "none";

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
        inset: "0",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center center",
        transform: "rotate(90deg) scale(1.34)",
        transformOrigin: "center center",
        zIndex: "0",
        pointerEvents: "none",
        filter: "saturate(1.06) contrast(1.04) brightness(.86)",
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
