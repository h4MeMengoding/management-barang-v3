import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProgressBar from "@/components/ProgressBar";
import RegisterSW from '@/components/RegisterSW';
import { Suspense } from "react";
import QueryProvider from '@/components/QueryProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import ThemeSync from '@/components/ThemeSync';

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
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Prevent FOUC - Critical inline styles with highest priority */
            :root {
              --bg-light: #F5F1E8;
              --bg-dark: #081210;
            }
            html { 
              background-color: #F5F1E8 !important;
              background: #F5F1E8 !important;
              transition: none !important;
            }
            html.dark { 
              background-color: #081210 !important;
              background: #081210 !important;
            }
            body { 
              background-color: inherit !important;
              background: inherit !important;
              transition: none !important;
            }
            /* Prevent any white flash on all containers */
            #__next, main, [data-nextjs-scroll-focus-boundary] {
              background-color: inherit !important;
            }
            /* Disable double-tap zoom but allow pinch zoom */
            * {
              touch-action: manipulation;
            }
            input, textarea, select {
              touch-action: auto;
            }
            /* Enable smooth transitions only after initial load */
            html.transitions-enabled {
              transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }
            html.transitions-enabled body {
              transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), color 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }
          `
        }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const root = document.documentElement;
                const getTheme = function() {
                  try {
                    const stored = localStorage.getItem('theme');
                    if (stored === 'dark') return 'dark';
                    if (stored === 'light') return 'light';
                    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  } catch (e) {
                    return 'light';
                  }
                };
                
                const theme = getTheme();
                const isDark = theme === 'dark';
                
                // Set immediately before any render
                root.className = root.className.replace(/\b(light|dark)\b/g, '');
                root.classList.add(isDark ? 'dark' : 'light');
                root.style.colorScheme = isDark ? 'dark' : 'light';
                root.setAttribute('data-theme', isDark ? 'dark' : 'light');
                
                // Update meta theme-color immediately
                var meta = document.querySelector('meta[name="theme-color"]');
                if (meta) meta.setAttribute('content', isDark ? '#081210' : '#F5F1E8');
              })();
            `,
          }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, interactive-widget=resizes-visual" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Manajemen Barang" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* iOS Splash Screens */}
        <link rel="apple-touch-startup-image" href="/splash/icon.png" />
        
        {/* iPhone - Portrait */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/iPhone_17_Pro_Max__iPhone_16_Pro_Max_portrait.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/iPhone_17_Pro__iPhone_17__iPhone_16_Pro_portrait.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/iPhone_16_Plus__iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_portrait.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/iPhone_16e__iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/iPhone_11__iPhone_XR_portrait.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_portrait.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png" />
        
        {/* iPhone - Landscape */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 932px) and (device-height: 430px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/splash/iPhone_17_Pro_Max__iPhone_16_Pro_Max_landscape.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 852px) and (device-height: 393px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/splash/iPhone_17_Pro__iPhone_17__iPhone_16_Pro_landscape.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 932px) and (device-height: 430px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/splash/iPhone_16_Plus__iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_landscape.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 852px) and (device-height: 393px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/splash/iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_landscape.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 844px) and (device-height: 390px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/splash/iPhone_16e__iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 926px) and (device-height: 428px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/splash/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 812px) and (device-height: 375px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/splash/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 896px) and (device-height: 414px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/splash/iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 896px) and (device-height: 414px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash/iPhone_11__iPhone_XR_landscape.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 736px) and (device-height: 414px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/splash/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_landscape.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 667px) and (device-height: 375px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_landscape.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 568px) and (device-height: 320px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png" />
        
        {/* iPad - Portrait */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/13__iPad_Pro_M4_portrait.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/12.9__iPad_Pro_portrait.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/11__iPad_Pro_M4_portrait.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/11__iPad_Pro__10.5__iPad_Pro_portrait.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/10.5__iPad_Air_portrait.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/10.9__iPad_Air_portrait.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/10.2__iPad_portrait.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/8.3__iPad_Mini_portrait.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_portrait.png" />
        
        {/* iPad - Landscape */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 1366px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash/13__iPad_Pro_M4_landscape.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 1366px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash/12.9__iPad_Pro_landscape.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 1194px) and (device-height: 834px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash/11__iPad_Pro_M4_landscape.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 1194px) and (device-height: 834px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash/11__iPad_Pro__10.5__iPad_Pro_landscape.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 1112px) and (device-height: 834px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash/10.5__iPad_Air_landscape.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 1180px) and (device-height: 820px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash/10.9__iPad_Air_landscape.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 1080px) and (device-height: 810px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash/10.2__iPad_landscape.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 1133px) and (device-height: 744px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash/8.3__iPad_Mini_landscape.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 1024px) and (device-height: 768px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_landscape.png" />
        
        <meta name="theme-color" content="#F5F1E8" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#081210" media="(prefers-color-scheme: dark)" />
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
          <ThemeSync />
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
