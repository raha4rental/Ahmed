import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Fraunces } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NativeInit } from "@/components/native-init";
import "./globals.css";

const sans = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Ahmed",
  description: "تطبيق أحمد — إدارة أحمد السعدي وتشغيل رايان",
  applicationName: "Ahmed",
  appleWebApp: {
    capable: true,
    title: "Ahmed",
    statusBarStyle: "black-translucent",
  },
  icons: { icon: "/logo.png", apple: "/apple-touch-icon.png" },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#14241f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans">
        <TooltipProvider>
          <StoreProvider>
            <NativeInit />
            {children}
            <Toaster />
          </StoreProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
