import type { MetadataRoute } from "next";
import { PLATFORM_LIST } from "@/lib/config/platforms";

const siteUrl = "https://fetchpoint.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    ...PLATFORM_LIST.map((p) => ({
      url: `${siteUrl}/${p.path}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
