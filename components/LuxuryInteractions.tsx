"use client";

import { useEffect } from "react";

export default function LuxuryInteractions() {
  useEffect(() => {
    const body = document.body;
    body.classList.add("luxury-enhanced");

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cleanup: Array<() => void> = [];

    const add = (element: Element, event: string, handler: EventListener) => {
      element.addEventListener(event, handler);
      cleanup.push(() => element.removeEventListener(event, handler));
    };

    const interactive = Array.from(
      document.querySelectorAll<HTMLElement>(
        'button, a.luxury-pill, a[class*="premium-button"], .luxury-save, .luxury-icon-button, input, select, textarea'
      )
    );

    interactive.forEach((element) => {
      element.classList.add("luxury-interactive");

      const press = () => {
        if ("vibrate" in navigator && !reduceMotion && window.matchMedia("(max-width: 1100px)").matches) {
          try {
            navigator.vibrate(8);
          } catch {
            // Some browsers expose vibrate but do not allow it in this context.
          }
        }
      };
      add(element, "pointerdown", press);
    });

    const cards = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.premium-card, main article, .luxury-feature-card, .luxury-mini-card, .luxury-glass'
      )
    ).filter((element, index, list) => list.indexOf(element) === index);

    cards.forEach((card) => card.classList.add("luxury-tilt", "luxury-reveal"));
    interactive.forEach((element) => element.classList.add("luxury-reveal"));

    if (!reduceMotion) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("luxury-revealed");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
      );

      document.querySelectorAll<HTMLElement>(".luxury-reveal").forEach((element) => observer.observe(element));
      cleanup.push(() => observer.disconnect());
    } else {
      document.querySelectorAll<HTMLElement>(".luxury-reveal").forEach((element) => element.classList.add("luxury-revealed"));
    }

    if (finePointer && !reduceMotion) {
      const ring = document.createElement("div");
      const dot = document.createElement("div");
      ring.className = "luxury-cursor-ring";
      dot.className = "luxury-cursor-dot";
      ring.setAttribute("aria-hidden", "true");
      dot.setAttribute("aria-hidden", "true");
      body.append(ring, dot);

      let raf = 0;
      let x = -100;
      let y = -100;
      let tx = x;
      let ty = y;

      const tick = () => {
        x += (tx - x) * 0.2;
        y += (ty - y) * 0.2;
        ring.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        raf = requestAnimationFrame(tick);
      };

      const move = (event: Event) => {
        const pointer = event as PointerEvent;
        tx = pointer.clientX;
        ty = pointer.clientY;
      };

      add(window, "pointermove", move);
      window.dispatchEvent(new Event("luxury-cursor-ready"));
      raf = requestAnimationFrame(tick);
      cleanup.push(() => {
        cancelAnimationFrame(raf);
        ring.remove();
        dot.remove();
      });

      interactive.forEach((element) => {
        const enter = () => body.classList.add("luxury-cursor-focus");
        const leave = () => body.classList.remove("luxury-cursor-focus");
        add(element, "pointerenter", enter);
        add(element, "pointerleave", leave);
      });

      cards.forEach((card) => {
        const moveCard = (event: Event) => {
          const pointer = event as PointerEvent;
          const rect = card.getBoundingClientRect();
          const px = (pointer.clientX - rect.left) / rect.width;
          const py = (pointer.clientY - rect.top) / rect.height;
          const ry = (px - 0.5) * 4.5;
          const rx = (0.5 - py) * 4;
          card.style.setProperty("--tilt-x", `${rx.toFixed(2)}deg`);
          card.style.setProperty("--tilt-y", `${ry.toFixed(2)}deg`);
          card.style.setProperty("--spot-x", `${(px * 100).toFixed(1)}%`);
          card.style.setProperty("--spot-y", `${(py * 100).toFixed(1)}%`);
        };
        const resetCard = () => {
          card.style.setProperty("--tilt-x", "0deg");
          card.style.setProperty("--tilt-y", "0deg");
          card.style.setProperty("--spot-x", "50%");
          card.style.setProperty("--spot-y", "50%");
        };
        add(card, "pointermove", moveCard);
        add(card, "pointerleave", resetCard);
      });
    }

    const goldenRoute = document.querySelectorAll<HTMLElement>("[data-golden-route]");
    goldenRoute.forEach((route) => route.classList.add("golden-route-active"));

    return () => cleanup.forEach((dispose) => dispose());
  }, []);

  return null;
}
