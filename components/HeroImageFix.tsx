export default function HeroImageFix() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          /* Step 1: make the Kandyan hero image independent of the broken local asset. */
          body.luxury-site main.home-rebuild #top {
            background-image: url("https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=2000&q=92") !important;
            background-size: cover !important;
            background-position: center center !important;
            background-repeat: no-repeat !important;
          }

          body.luxury-site main.home-rebuild #top > img {
            display: none !important;
          }
        `,
      }}
    />
  );
}
