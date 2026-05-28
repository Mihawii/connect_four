import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { Providers } from "./providers";
import { Nav } from "@/components/layout/Nav";
import { PageTransition } from "@/components/layout/PageTransition";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Inferno — Blitz Connect Four",
  description: "Bullet Connect Four. Every disc burns after ten of your turns.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: { title: "Inferno", description: "Blitz Connect Four with a burning board.", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#2f271f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${geistMono.variable} ${bricolage.variable} font-sans antialiased min-h-svh`}
      >
        <Providers>
          <div className="flex min-h-svh flex-col">
            <Nav />
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
