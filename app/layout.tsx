import type { Metadata, Viewport } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { PWARegister } from "@/components/pwa-register";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n/context";
import "katex/dist/katex.min.css";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CraftAI - AI Skills Platform",
    template: "%s | CraftAI",
  },
  description: "One platform, unlimited AI skills. Write code, create content, research, translate, and more. Powered by Claude AI.",
  keywords: ["AI", "artificial intelligence", "skills", "Claude", "AI platform", "code", "writing", "research"],
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
    locale: "en_US",
    siteName: "CraftAI",
    title: "CraftAI - AI Skills Platform",
    description: "One platform, unlimited AI skills. Powered by Claude AI.",
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
    <html lang="en" className={`dark ${outfit.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground transition-colors duration-300">
        <ThemeProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
          <Toaster />
          <PWARegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
