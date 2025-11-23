import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProgressBar from "@/components/ProgressBar";
import RegisterSW from '@/components/RegisterSW';
import { Suspense } from "react";
import QueryProvider from '@/components/QueryProvider';
import { ThemeProvider } from '@/components/ThemeProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Manajemen Barang",
  description: "Sistem manajemen penyimpanan barang",
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96' }
    ],
    apple: '/favicon/apple-touch-icon.png'
  }
  ,
  manifest: '/manifest.json',
  themeColor: '#F5F1E8'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-visual" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Manajemen Barang" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#F5F1E8" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1C1C1E" media="(prefers-color-scheme: dark)" />
        <meta name="msapplication-TileColor" content="#F5F1E8" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="color-scheme" content="light dark" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon/web-app-manifest-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon/web-app-manifest-512x512.png" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased touch-pan-x touch-pan-y`}
      >
        <ThemeProvider>
          <QueryProvider>
            <Suspense fallback={null}>
              <ProgressBar />
              <RegisterSW />
            </Suspense>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
