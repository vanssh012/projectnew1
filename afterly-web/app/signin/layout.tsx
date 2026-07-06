import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://afterlydemo.loca.lt"),
  title: "Sign In — Afterly",
  openGraph: { siteName: "Afterly", images: ["/og-image.png"] },
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
