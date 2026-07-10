import { type MetadataRoute } from "next";

import { PUBLIC_SITEMAP_PATHS } from "@/lib/routes/http-route-catalogue";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://rumia.pt";

  return PUBLIC_SITEMAP_PATHS.map((route) => ({
    url: route === "/" ? `${baseUrl}/` : `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "/" ? 1 : 0.8
  }));
}
