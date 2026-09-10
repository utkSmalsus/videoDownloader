import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/history", "/settings"] },
    ],
    sitemap: "https://fetchpoint.app/sitemap.xml",
  };
}
