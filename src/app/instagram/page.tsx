import type { Metadata } from "next";
import { PlatformPageTemplate } from "@/components/downloader/platform-page-template";
import { PLATFORMS } from "@/lib/config/platforms";

const config = PLATFORMS.instagram;

export const metadata: Metadata = {
  title: `${config.name} Downloader`,
  description: config.description,
  alternates: { canonical: "/instagram" },
};

export default function Page() {
  return <PlatformPageTemplate platform="instagram" />;
}
