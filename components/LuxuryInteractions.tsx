"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const HERO_VIDEO_URL = "https://drive.usercontent.google.com/download?export=download&id=1AC9-f3h4WRnM2pSVLX-ab_zgjghLJF0V&confirm=t";

export default function LuxuryInteractions() {
  const pathname = usePathname();

  useEffect(() => {
    const body = document.body;
    body.classList.add("luxury-enhanced");

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanup: Array<() => void> = [];

    const add = (target: EventTarget, event: string, handler: EventListener) => {
      target.addEventListener(event, handler);
      cleanup.push(() => target.removeEventListener(event, handler));
    };

    const hero = document.querySelector<HTMLElement>(".luxury-hero");
    if (hero) {
      const legacyHeroImage = hero.querySelector<HTMLElement>("div.bg-cover.bg-center");
      if (legacyHeroImage) legacyHeroImage.style.display = "none";

      const video = document.createElement("video");
      video.className = "discoverlanka-hero-video";
      video.src = HERO_VIDEO_URL;
      video.autoplay = !reduceMotion;
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
        width: "100dvh",
        height: "100vw",
        maxWidth: "none",
        maxHeight: "none",
        objectFit: "cover",
        objectPosition: "center",
        transform: "translate(-50%, -50%) rotate(90deg) scale(1.035)",
        transformOrigin: "center",
        zIndex: "0",
        pointerEvents: "none",
        filter: "saturate(1.08) contrast(1.05) brightness(.88)",
      });

      hero.prepend(video);

      const overlays = Array.from(hero.children).filter((node): node is HTMLElement => node instanceof HTMLElement);
      overlays.forEach((node) => {
        if (node === video) return;
        const currentZ = window.getComputedStyle(node).zIndex;
        if (currentZ === "auto" || currentZ === "") node.style.zIndex = "1";
      });

      const heroContent = hero.querySelector<HTMLElement>(":scope > div.relative");
      if (heroContent) heroContent.style.zIndex = "2";

      const heroPanel = hero.querySelector<HTMLElement>(".hero-glass-panel");
      if (heroPanel) {
        heroPanel.style.background = "transparent";
        heroPanel.style.border = "0";
        heroPanel.style.borderRadius = "0";
        heroPanel.style.boxShadow = "none";
        heroPanel.style.backdropFilter = "none";
        heroPanel.style.padding = "0";
      }

      const credit = Array.from(hero.querySelectorAll<HTMLElement>("div")).find((node) => node.textContent?.trim().startsWith("Photo: Dilshan255"));
      if (credit) credit.remove();

      const play = () => {
        if (!reduceMotion) video.play().catch(() => {});
      };
      add(video, "loadeddata", play);
      add(video, "canplay", play);
      add(video, "error", () => {
        const fallback = hero.querySelector<HTMLElement>("div.bg-cover.bg-center");
        if (fallback) fallback.style.display = "block";
        video.style.display = "none";
      });

      cleanup.push(() => {
        video.pause();
        video.removeAttribute("src");
        video.load();
        video.remove();
      });
    }

    const interactive = Array.from(document.querySelectorAll<HTMLElement>('button, a.luxury-pill, a[class*="premium-button"], .luxury-save, .luxury-icon-button, input, select, textarea'));
    interactive.forEach((element) => {
      element.classList.add("luxury-interactive");
      const press = () => {
        if ("vibrate" in navigator && !reduceMotion && window.matchMedia("(max-width: 1100px)").matches) {
          try { navigator.vibrate(8); } catch {}
        }
      };
      add(element, "pointerdown", press);
    });

    const cards = Array.from(document.querySelectorAll<HTMLElement>('.premium-card, main article, .luxury-feature-card, .luxury-mini-card, .luxury-glass')).filter((element, index, list) => list.indexOf(element) === index);
    cards.forEach((card) => card.classList.add("luxury-tilt", "luxury-reveal"));
    interactive.forEach((element) => element.classList.add("luxury-reveal"));

    if (!reduceMotion) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("luxury-revealed");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
      document.querySelectorAll<HTMLElement>(".luxury-reveal").forEach((element) => observer.observe(element));
      cleanup.push(() => observer.disconnect());
    } else {
      document.querySelectorAll<HTMLElement>(".luxury-reveal").forEach((element) => element.classList.add("luxury-revealed"));
    }

    const launch = document.createElement("a");
    launch.className = "concierge-launcher luxury-interactive";
    launch.href = "/concierge";
    launch.innerHTML = '<span class="concierge-launcher-dot" aria-hidden="true"></span><span>Concierge</span><span class="concierge-launcher-arrow" aria-hidden="true">↗</span>';
    launch.setAttribute("aria-label", "Open DiscoverLanka Concierge");
    if (pathname !== "/concierge") body.appendChild(launch);
    cleanup.push(() => launch.remove());

    if (finePointer && !reduceMotion) {
      const ring = document.createElement("div");
      const dot = document.createElement("div");
      ring.className = "luxury-cursor-ring";
      dot.className = "luxury-cursor-dot";
      ring.setAttribute("aria-hidden", "true");
      dot.setAttribute("aria-hidden", "true");
      body.append(ring, dot);

      let raf = 0;
      let x = -100; let y = -100; let tx = x; let ty = y;
      const tick = () => {
        x += (tx - x) * 0.2; y += (ty - y) * 0.2;
        ring.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        body.style.setProperty("--lux-cursor-x", `${tx}px`);
        body.style.setProperty("--lux-cursor-y", `${ty}px`);
        raf = requestAnimationFrame(tick);
      };
      const move = (event: Event) => { const pointer = event as PointerEvent; tx = pointer.clientX; ty = pointer.clientY; };
      add(window, "pointermove", move);
      raf = requestAnimationFrame(tick);
      cleanup.push(() => { cancelAnimationFrame(raf); ring.remove(); dot.remove(); });

      [...interactive, launch].forEach((element) => {
        add(element, "pointerenter", () => body.classList.add("luxury-cursor-focus"));
        add(element, "pointerleave", () => body.classList.remove("luxury-cursor-focus"));
      });

      cards.forEach((card) => {
        const moveCard = (event: Event) => {
          const pointer = event as PointerEvent;
          const rect = card.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const px = Math.min(1, Math.max(0, (pointer.clientX - rect.left) / rect.width));
          const py = Math.min(1, Math.max(0, (pointer.clientY - rect.top) / rect.height));
          card.style.setProperty("--tilt-x", `${((0.5 - py) * 4).toFixed(2)}deg`);
          card.style.setProperty("--tilt-y", `${((px - 0.5) * 4.5).toFixed(2)}deg`);
          card.style.setProperty("--spot-x", `${(px * 100).toFixed(1)}%`);
          card.style.setProperty("--spot-y", `${(py * 100).toFixed(1)}%`);
        };
        const resetCard = () => {
          card.style.setProperty("--tilt-x", "0deg"); card.style.setProperty("--tilt-y", "0deg");
          card.style.setProperty("--spot-x", "50%"); card.style.setProperty("--spot-y", "50%");
        };
        add(card, "pointermove", moveCard); add(card, "pointerleave", resetCard);
      });
    }

    document.querySelectorAll<HTMLElement>("[data-golden-route]").forEach((route) => route.classList.add("golden-route-active"));
    return () => { cleanup.forEach((dispose) => dispose()); body.classList.remove("luxury-enhanced", "luxury-cursor-focus"); };
  }, [pathname]);

  return null;
}
