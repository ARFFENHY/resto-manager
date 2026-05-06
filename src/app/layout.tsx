import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RestoManager - El Cerebro de tu Restaurante",
  description: "Sistema integral de POS, KDS y Menú Digital QR. Control total sin comisiones.",
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} antialiased`}>
      <body className="font-sans bg-background text-foreground min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
