import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kommando — Allemand en 5 jours",
    short_name: "Kommando",
    description: "Allemand de survie, cinq jours, orthographe suisse.",
    start_url: "/",
    display: "standalone",
    background_color: "#F3F1EC",
    theme_color: "#000000",
    lang: "fr",
  }
}
