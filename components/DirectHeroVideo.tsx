"use client";

import { useEffect } from "react";

const HERO_IMAGE_PATH = "/hero-home.jpg";

export default function DirectHeroVideo() {
  useEffect(() => {
    const apply = () => {
      const hero = document.querySelector<HTMLElement>(".luxury-hero");
      if (!hero) return;
      hero.querySelectorAll<HTMLVideoElement>("video").forEach((video) => video.remove());
      hero.querySelectorAll<HTMLElement>(":scope > .absolute").forEach((layer) => layer.remove());

      const grid = hero.querySelector<HTMLElement>(".hero-glass-panel > div.grid");
      if (grid) {
        grid.lastElementChild?.remove();
        grid.classList.remove("lg:grid-cols-[1.08fr_.92fr]");
        grid.style.display = "block";
      }

      let style = document.getElementById("discoverlanka-hero-image-style") as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement("style");
        style.id = "discoverlanka-hero-image-style";
        style.textContent = `
          .luxury-home .luxury-hero{position:relative!important;overflow:hidden!important;background:#07120f!important}
          .luxury-home .luxury-hero .hero-glass-panel,
          .luxury-home .luxury-hero .hero-glass-panel::before,
          .luxury-home .luxury-hero .hero-glass-panel::after{background:transparent!important;border:0!important;box-shadow:none!important;backdrop-filter:none!important;padding:0!important}
          .luxury-home .luxury-hero .luxury-display{text-shadow:0 6px 24px rgba(0,0,0,.34)!important}
          .luxury-home .luxury-hero .hero-glass-panel > div.grid{width:100%!important}
        `;
        document.head.appendChild(style);
      }

      let image = hero.querySelector<HTMLImageElement>("[data-direct-hero-image]");
      if (!image) {
        image = document.createElement("img");
        image.dataset.directHeroImage = "true";
        image.src = HERO_IMAGE_PATH;
        image.alt = "Kandy Lake and Sri Dalada Maligawa, Sri Lanka";
        Object.assign(image.style,{position:"absolute",inset:"0",width:"100%",height:"100%",objectFit:"cover",objectPosition:"center center",zIndex:"0",pointerEvents:"none"});
        hero.prepend(image);
      }

      const content = hero.querySelector<HTMLElement>(":scope > div.relative");
      if (content) content.style.zIndex = "2";
    };

    const frame = requestAnimationFrame(apply);
    const retry = window.setTimeout(apply, 300);
    const lateRetry = window.setTimeout(apply, 1000);
    return () => { cancelAnimationFrame(frame); clearTimeout(retry); clearTimeout(lateRetry); };
  }, []);

  return null;
}
