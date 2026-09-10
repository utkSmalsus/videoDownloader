import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/layout/app-shell";
import { BRAND_NAME } from "@/components/icons/logo";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = "https://fetchpoint.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${BRAND_NAME} — One link. Your media.`, template: `%s · ${BRAND_NAME}` },
  description:
    "Paste a YouTube, Instagram, X, or Facebook link and get available media formats through a compliant processing pipeline.",
  openGraph: {
    title: `${BRAND_NAME} — One link. Your media.`,
    description: "Download media from the web, effortlessly.",
    url: siteUrl,
    siteName: BRAND_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} — One link. Your media.`,
    description: "Download media from the web, effortlessly.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
