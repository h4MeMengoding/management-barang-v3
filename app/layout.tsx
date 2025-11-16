import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProgressBar from "@/components/ProgressBar";
import RegisterSW from '@/components/RegisterSW';
import { Suspense } from "react";
import QueryProvider from '@/components/QueryProvider';

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
  themeColor: '#10B981'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <Suspense fallback={null}>
            <ProgressBar />
            <RegisterSW />
          </Suspense>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
