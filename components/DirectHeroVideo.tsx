"use client";

import { useEffect } from "react";

const HERO_VIDEO_PATH = "/hero/srilankantravel.mp4";

export default function DirectHeroVideo() {
  useEffect(() => {
    const apply = () => {
      const hero = document.querySelector<HTMLElement>(".luxury-hero");
      if (!hero) return;

      // Remove any legacy hero video/image layers that compete with the real local asset.
      hero.querySelectorAll<HTMLVideoElement>("video:not([data-direct-hero-video])").forEach((video) => video.remove());
      hero.querySelectorAll<HTMLElement>("div.bg-cover.bg-center").forEach((layer) => { layer.style.display = "none"; });

      // Remove the two decorative glass cards from the hero and the old image credit.
      const grid = hero.querySelector<HTMLElement>(".hero-glass-panel > div.grid");
      if (grid) {
        const visualColumn = grid.lastElementChild as HTMLElement | null;
        if (visualColumn) visualColumn.remove();
      }
      hero.querySelectorAll<HTMLElement>(".absolute.bottom-5.left-5").forEach((credit) => credit.remove());

      // Keep only a very light cinematic tint behind the typography.
      const overlays = hero.querySelectorAll<HTMLElement>(":scope > div.absolute.inset-0");
      overlays.forEach((overlay, index) => {
        if (index === 0) overlay.style.display = "none";
        if (index === 1) overlay.style.background = "linear-gradient(90deg, rgba(3,14,11,.34) 0%, rgba(3,14,11,.12) 46%, rgba(3,14,11,.02) 100%)";
        if (index === 2) overlay.style.background = "radial-gradient(circle at 68% 28%, rgba(236,194,105,.10), transparent 34%)";
      });

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
        transform: "translate(-50%, -50%) rotate(90deg) scale(1.015)",
        transformOrigin: "center center",
        zIndex: "0",
        pointerEvents: "none",
        filter: "saturate(1.05) contrast(1.03) brightness(.93)",
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
