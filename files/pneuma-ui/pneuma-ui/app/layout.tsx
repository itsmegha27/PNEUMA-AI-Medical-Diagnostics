import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

/** One family across its width axis; mono is for instrument readouts only. */
const archivo = Archivo({
  subsets: ["latin"], axes: ["wdth"], display: "swap", variable: "--font-sans",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Pneuma — chest radiograph analysis",
  description: "See what the image reveals. Research prototype; not a diagnostic device.",
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
