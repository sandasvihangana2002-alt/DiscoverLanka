"use client";

const HERO_IMAGE_PATH = "/hero-home.jpg";

export default function DirectHeroVideo() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          .luxury-home .luxury-hero {
            position: relative !important;
            overflow: hidden !important;
            background: url("${HERO_IMAGE_PATH}") center center / cover no-repeat !important;
          }

          .luxury-home .luxury-hero > .absolute {
            display: none !important;
          }

          .luxury-home .luxury-hero .hero-glass-panel {
            position: relative !important;
            z-index: 2 !important;
            width: 100% !important;
            padding: 34px !important;
            background: transparent !important;
            border: 0 !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }

          .luxury-home .luxury-hero .hero-glass-panel::before,
          .luxury-home .luxury-hero .hero-glass-panel::after {
            display: none !important;
          }

          .luxury-home .luxury-hero .hero-glass-panel > div.grid {
            display: block !important;
            width: 100% !important;
          }

          .luxury-home .luxury-hero .hero-glass-panel > div.grid > div:last-child {
            display: none !important;
          }

          .luxury-home .luxury-hero .luxury-display {
            text-shadow: 0 6px 24px rgba(0,0,0,.42) !important;
          }

          @media (max-width: 900px) {
            .luxury-home .luxury-hero .hero-glass-panel {
              padding: 26px !important;
            }
          }

          @media (max-width: 640px) {
            .luxury-home .luxury-hero .hero-glass-panel {
              padding: 20px !important;
            }
          }
        `,
      }}
    />
  );
}
