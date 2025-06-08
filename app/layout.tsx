import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/auth-provider";
import { I18nProvider } from "@/lib/i18n/context";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/comp-581";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voice of Eagle",
  description: "Voice of Eagle - Your source for the latest rumors, lineup updates, and insights",
  keywords: ["voice of eagle", "rumors", "lineup", "news", "updates"],
  authors: [{ name: "Hasan Harman", url: "https://x.com/strd3r" }],
  creator: "Hasan Harman",
  openGraph: {
    title: "Voice of Eagle",
    description: "Voice of Eagle - Your source for the latest rumors, lineup updates, and insights",
    url: "https://voice-of-eagle.vercel.app",
    siteName: "Voice of Eagle",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Voice of Eagle",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Voice of Eagle",
    description: "Voice of Eagle - Your source for the latest rumors, lineup updates, and insights",
    creator: "@strd3r",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <I18nProvider>
            <AuthProvider>
              <Navbar />
              <main className="h-[calc(100vh-68px)] bg-background">{children}</main>
              <Toaster />
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
