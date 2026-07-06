import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://afterlydemo.loca.lt"),
  title: "Explore Events — Afterly",
  openGraph: { siteName: "Afterly", images: ["/og-image.png"] },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
