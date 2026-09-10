import { createNeonAuth } from "@neondatabase/auth/next/server";

const baseUrl = process.env.NEON_AUTH_BASE_URL || "https://ep-floral-scene-azp8it6j.neonauth.c-3.ap-southeast-1.aws.neon.tech/lovesrilanka/auth";

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET || "",
  },
});
