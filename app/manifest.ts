import type { MetadataRoute } from "next";

/**
 * What a phone uses when somebody adds the board to their home screen. The
 * icons are the ones scripts/logo-export.ts writes. No colours here: the
 * browser takes them from the page, and the accent stays in app/globals.css.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GoodSocials",
    short_name: "GoodSocials",
    description: "AI social media manager for LinkedIn.",
    start_url: "/board",
    display: "standalone",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/avatar-400.png", sizes: "400x400", type: "image/png" },
    ],
  };
}
