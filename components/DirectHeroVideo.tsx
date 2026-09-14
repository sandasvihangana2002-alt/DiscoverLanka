export default function DirectHeroVideo() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          /* Hero intentionally has no image/video asset. Keep the section clean and text-only. */
          body.luxury-site main.luxury-home #top.luxury-hero {
            position: relative !important;
            isolation: isolate !important;
            overflow: hidden !important;
            background: #07120f !important;
            background-image: none !important;
          }

          /* Remove every legacy hero image/overlay layer from the old layout. */
          body.luxury-site main.luxury-home #top.luxury-hero > .absolute {
            display: none !important;
            background-image: none !important;
          }

          body.luxury-site main.luxury-home #top.luxury-hero .hero-glass-panel > div.grid > div:last-child {
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
        `,
      }}
    />
  );
}
