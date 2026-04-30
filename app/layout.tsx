import type { Metadata } from "next";
import { Geist, Geist_Mono, Alice } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { MerchCartProvider } from "@/components/MerchCartProvider";
import { Header } from "@/components/Header";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const alice = Alice({
  variable: "--font-alice",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Tatvam 2026",
    default: "Tatvam 2026 | JSSMC",
  },
  description: "Official registration and merchandise portal for Tatvam 2026.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${alice.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <CartProvider>
          <MerchCartProvider>
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
          </MerchCartProvider>
        </CartProvider>
        <Toaster position="bottom-right" richColors />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
