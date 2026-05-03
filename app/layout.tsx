import type { Metadata } from "next";
import { Geist, Geist_Mono, Alice } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { MerchCartProvider } from "@/components/MerchCartProvider";
import { SportsCartProvider } from "@/components/SportsCartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const alice = Alice({
  variable: "--font-alice",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Tatvam 2026",
    default: "Tatvam 2026 | JSSMC",
  },
  description: "Official registration and merchandise portal for Tatvam 2026.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${alice.variable}`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased font-sans flex flex-col min-h-screen">
        <CartProvider>
          <SportsCartProvider>
            <MerchCartProvider>
              <Header />
              <main className="flex-1 flex flex-col">{children}</main>
              <Footer />
            </MerchCartProvider>
          </SportsCartProvider>
        </CartProvider>
        <Toaster position="bottom-right" richColors />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
