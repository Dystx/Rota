import { type MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: [
        "/admin/", "/reviewer/", "/account/", "/trip/", "/api/", "/b2b/", "/guide/", "/sign-in", "/console/", "/planner", "/checkout", "/itineraries", "/vault"
      ],
    },
    sitemap: "https://rumia.pt/sitemap.xml"
  };
}
