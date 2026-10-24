import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/components/shell/Providers";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  variable: "--font-archivo",
  axes: ["wdth"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Lumen Learn: Nigeria-first learning ecosystem (demo)", template: "%s · Lumen Learn demo" },
  description:
    "An interactive prototype of a learning ecosystem for Nigeria: school management, e-learning, a vetted tutor marketplace, guardian oversight, quiz tournaments and school discovery. Fictional data only.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#FFC800",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={`${archivo.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only z-[100] rounded-xl bg-ink px-4 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
