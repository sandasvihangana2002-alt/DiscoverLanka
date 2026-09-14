const HERO_IMAGE_PATH = "/hero-home.jpg";

export default function DirectHeroVideo() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          body.luxury-site main.luxury-home #top.luxury-hero {
            position: relative !important;
            isolation: isolate !important;
            overflow: hidden !important;
            background-color: #07120f !important;
            background-image: url("${HERO_IMAGE_PATH}") !important;
            background-size: cover !important;
            background-position: center center !important;
            background-repeat: no-repeat !important;
          }

          body.luxury-site main.luxury-home #top.luxury-hero > .absolute {
            display: none !important;
          }

          body.luxury-site main.luxury-home #top.luxury-hero .hero-glass-panel {
            position: relative !important;
            z-index: 2 !important;
            width: 100% !important;
            background: transparent !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            padding: 0 !important;
          }

          body.luxury-site main.luxury-home #top.luxury-hero .hero-glass-panel::before,
          body.luxury-site main.luxury-home #top.luxury-hero .hero-glass-panel::after {
            display: none !important;
          }

          body.luxury-site main.luxury-home #top.luxury-hero .hero-glass-panel > div.grid {
            display: block !important;
            width: 100% !important;
          }

          body.luxury-site main.luxury-home #top.luxury-hero .hero-glass-panel > div.grid > div:last-child {
            display: none !important;
          }

          body.luxury-site main.luxury-home #top.luxury-hero .luxury-display {
            text-shadow: 0 5px 24px rgba(0, 0, 0, .42) !important;
          }
        `,
      }}
    />
  );
}
