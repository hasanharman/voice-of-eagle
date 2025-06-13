import type { Metadata } from "next";
import { Geist, Geist_Mono, Edu_AU_VIC_WA_NT_Hand } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { QueryProvider } from '@/components/QueryProvider';

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

const eduAU = Edu_AU_VIC_WA_NT_Hand({
  variable: "--font-edu-au",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Voice of Eagle",
  description:
    "Voice of Eagle - Your source for the latest rumors, lineup updates, and insights",
  keywords: ["voice of eagle", "rumors", "lineup", "news", "updates"],
  authors: [{ name: "Hasan Harman", url: "https://x.com/strad3r" }],
  creator: "Hasan Harman",
  openGraph: {
    title: "Voice of Eagle",
    description:
      "Voice of Eagle - Your source for the latest rumors, lineup updates, and insights",
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
    description:
      "Voice of Eagle - Your source for the latest rumors, lineup updates, and insights",
    creator: "@strad3r",
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
    <html
      suppressHydrationWarning
    >
      <head>
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="fdf36f5a-ed59-469c-a68f-eeadf1e7cd04"
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${eduAU.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <I18nProvider>
              <AuthProvider>
                <Navbar />
                <main className="h-[calc(100vh-68px)] bg-background">
                  {children}
                </main>
                <Toaster />
              </AuthProvider>
            </I18nProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
      <GoogleAnalytics gaId="G-3YSWM1MXZK" />
    </html>
  );
}
