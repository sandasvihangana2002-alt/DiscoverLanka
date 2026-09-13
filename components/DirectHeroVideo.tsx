"use client";

import { useEffect } from "react";

const HERO_IMAGE_PATH = "/hero-home.jpg";

export default function DirectHeroVideo() {
  useEffect(() => {
    const apply = async () => {
      const hero = document.querySelector<HTMLElement>(".luxury-hero");
      if (!hero) return;

      hero.querySelectorAll<HTMLVideoElement>("video").forEach((video) => video.remove());
      hero.querySelectorAll<HTMLElement>("div.bg-cover.bg-center").forEach((layer) => { layer.style.display = "none"; });

      const grid = hero.querySelector<HTMLElement>(".hero-glass-panel > div.grid");
      if (grid?.lastElementChild) grid.lastElementChild.remove();
      hero.querySelectorAll<HTMLElement>(".absolute.bottom-5.left-5").forEach((credit) => credit.remove());

      let style = document.getElementById("discoverlanka-hero-clean-style") as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement("style");
        style.id = "discoverlanka-hero-clean-style";
        style.textContent = `
          .luxury-home .luxury-hero::after { display:none !important; }
          .luxury-home .luxury-hero .hero-glass-panel,
          .luxury-home .luxury-hero .hero-glass-panel::before,
          .luxury-home .luxury-hero .hero-glass-panel::after { background:transparent !important; border:0 !important; box-shadow:none !important; backdrop-filter:none !important; padding:0 !important; }
          .luxury-home .luxury-hero .luxury-display { text-shadow:0 10px 32px rgba(0,0,0,.26) !important; }
        `;
        document.head.appendChild(style);
      }

      const existing = hero.querySelector<HTMLElement>("[data-direct-hero-image]");
      if (existing) return;

      const image = document.createElement("img");
      image.dataset.directHeroImage = "true";
      image.alt = "Kandy Lake and Sri Dalada Maligawa, Sri Lanka";
      Object.assign(image.style, {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center 52%",
        zIndex: "0",
        pointerEvents: "none",
      });
      hero.prepend(image);

      try {
        const response = await fetch(HERO_IMAGE_PATH, { cache: "force-cache" });
        const encoded = (await response.text()).trim();
        if (!encoded.startsWith("/9j/")) throw new Error("Invalid hero image asset");
        image.src = `data:image/jpeg;base64,${encoded}`;
      } catch {
        image.remove();
      }

      const content = hero.querySelector<HTMLElement>(":scope > div.relative");
      if (content) content.style.zIndex = "2";
    };

    const frame = requestAnimationFrame(() => { void apply(); });
    const retry = window.setTimeout(() => { void apply(); }, 300);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(retry);
    };
  }, []);

  return null;
}
