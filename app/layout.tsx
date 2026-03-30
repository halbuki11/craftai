import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { PWARegister } from "@/components/pwa-register";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CraftAI - AI Yeteneklerini Keşfet",
    template: "%s | CraftAI",
  },
  description: "Tek platform, sınırsız AI yeteneği. PDF özetleme, kod yazma, içerik üretme, araştırma ve daha fazlası. Claude AI ile güçlendirilmiş skill marketplace.",
  keywords: ["AI", "yapay zeka", "skill", "PDF özetleme", "kod yazma", "içerik üretme", "Claude", "AI marketplace"],
  authors: [{ name: "CraftAI" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CraftAI",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "CraftAI",
    title: "CraftAI - AI Yeteneklerini Keşfet",
    description: "Tek platform, sınırsız AI yeteneği. Claude AI ile güçlendirilmiş skill marketplace.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
          <PWARegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
