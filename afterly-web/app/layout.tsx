import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CustomCursor from "./components/CustomCursor";
import { ToastProvider } from "./components/ToastProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Afterly — Your People. Your Night.",
  description:
    "Discover and host curated college events — farewells, freshers nights, and themed house parties. Verified hosts, approval-based entry, unforgettable nights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ToastProvider>
          <CustomCursor />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
