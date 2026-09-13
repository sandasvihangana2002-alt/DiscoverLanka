"use client";

import { useEffect } from "react";

const HERO_IMAGE_PATH = "/hero-home.jpg";

export default function DirectHeroVideo() {
  useEffect(() => {
    const apply = async () => {
      const hero = document.querySelector<HTMLElement>(".luxury-hero");
      if (!hero) return;

      // Remove every video from the hero so the video asset can never win the render race.
      hero.querySelectorAll<HTMLVideoElement>("video").forEach((video) => video.remove());

      // Remove all decorative background layers and the old image-credit/fade layers.
      hero.querySelectorAll<HTMLElement>("div.bg-cover.bg-center").forEach((layer) => (layer.style.display = "none"));
      hero.querySelectorAll<HTMLElement>(".absolute.inset-0").forEach((layer) => {
        const cls = layer.className || "";
        if (cls.includes("linear-gradient") || cls.includes("radial-gradient")) layer.style.display = "none";
      });
      hero.querySelectorAll<HTMLElement>(".absolute.bottom-5.left-5").forEach((credit) => credit.remove());
      hero.querySelectorAll<HTMLElement>(".absolute.bottom-0.left-0.right-0").forEach((fade) => fade.remove());

      // Remove both right-side hero cards/visuals.
      const grid = hero.querySelector<HTMLElement>(".hero-glass-panel > div.grid");
      if (grid?.lastElementChild) grid.lastElementChild.remove();

      let style = document.getElementById("discoverlanka-hero-image-style") as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement("style");
        style.id = "discoverlanka-hero-image-style";
        style.textContent = `
          .luxury-home .luxury-hero { position:relative!important; overflow:hidden!important; background:#07120f!important; }
          .luxury-home .luxury-hero .hero-glass-panel,
          .luxury-home .luxury-hero .hero-glass-panel::before,
          .luxury-home .luxury-hero .hero-glass-panel::after { background:transparent!important; border:0!important; box-shadow:none!important; backdrop-filter:none!important; padding:0!important; }
          .luxury-home .luxury-hero .luxury-display { text-shadow:0 6px 24px rgba(0,0,0,.34)!important; }
          .luxury-home .luxury-hero .hero-glass-panel > div.grid { display:block!important; }
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
        objectPosition: "center center",
        zIndex: "0",
        pointerEvents: "none",
      });
      hero.prepend(image);

      try {
        const response = await fetch(HERO_IMAGE_PATH, { cache: "no-store" });
        const raw = (await response.text()).trim();
        const encoded = raw.startsWith("data:image/") ? raw : `data:image/jpeg;base64,${raw}`;
        image.src = encoded;
      } catch {
        image.remove();
      }

      const content = hero.querySelector<HTMLElement>(":scope > div.relative");
      if (content) content.style.zIndex = "2";
    };

    const frame = requestAnimationFrame(() => void apply());
    const retry = window.setTimeout(() => void apply(), 300);
    const lateRetry = window.setTimeout(() => void apply(), 1000);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(retry);
      window.clearTimeout(lateRetry);
    };
  }, []);

  return null;
}
