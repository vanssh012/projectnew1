import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://projectnew1-two.vercel.app"),
  title: "Host — Afterly",
  openGraph: { siteName: "Afterly", images: ["/og-image.png"] },
};

export default function HostMetaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
