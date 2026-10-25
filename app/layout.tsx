import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { FavoritesProvider } from "@/components/providers/favorites-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { MobileNav } from "@/components/nav";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
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
  themeColor: "#F4F7FB",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} font-sans`}>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{const saved=localStorage.getItem('chauka-theme');if(saved==='dark'||(!saved&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}",
          }}
        />
        <a
          href="#main"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition focus:translate-y-0"
        >
          Skip to content
        </a>
        <ToastProvider>
          <FavoritesProvider>
            <SiteHeader />
            <main id="main" className="min-h-[calc(100vh-5rem)]">
              {children}
            </main>
            <SiteFooter />
            <MobileNav />
          </FavoritesProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
