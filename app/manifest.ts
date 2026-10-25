import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chauka — Live Cricket Scores",
    short_name: "Chauka",
    description:
      "Live cricket scores, commentary, scorecards, series tables, ICC rankings and player profiles.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#EDE8DE",
    theme_color: "#1F30B4",
    categories: ["sports", "news"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
