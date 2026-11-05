import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { FavoritesProvider } from "@/components/providers/favorites-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { SiteFooter, SiteHeader, SiteNav, SiteSidebar } from "@/components/site-chrome";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const title = "Chauka — Live Cricket Scores, Series & Rankings";
const description =
  "Live cricket scores, ball-by-ball commentary, full scorecards, series tables, ICC rankings and player profiles. Fast, calm and built for every screen.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · Chauka",
  },
  description,
  applicationName: "Chauka",
  keywords: [
    "cricket",
    "live cricket score",
    "cricket scorecard",
    "cricket commentary",
    "ICC rankings",
    "cricket series",
    "player profiles",
  ],
  authors: [{ name: "Chauka" }],
  creator: "Chauka",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Chauka",
    locale: "en_IN",
    title,
    description,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Chauka — live cricket, without the noise",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Chauka",
  },
  formatDetection: {
    telephone: false,
  },
  category: "sports",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EEF4FF" },
    { media: "(prefers-color-scheme: dark)", color: "#070D1F" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${sans.variable} ${display.variable} ${mono.variable} font-sans`}>
                <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('chauka-theme')!=='light'){document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}",
          }}
        />
        <a
          href="#main"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition focus:translate-y-0"
        >
          Skip to content
        </a>
        <ToastProvider>
          <FavoritesProvider>
            <SiteSidebar />
            <div className="lg:pl-[76px]">
              <SiteHeader />
              <main id="main" className="min-h-[calc(100vh-5rem)]">
                {children}
              </main>
              <SiteFooter />
            </div>
            <SiteNav />
          </FavoritesProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
