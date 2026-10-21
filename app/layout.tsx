import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const themeScript = `(function(){try{var t=localStorage.getItem("kommando-theme");var d=matchMedia("(prefers-color-scheme: dark)").matches;if(t){d=t==="dark";}document.documentElement.classList.toggle("dark",d);var mode="light";var bg="#F3F1EC";if(d){mode="dark";bg="#000";}document.documentElement.style.colorScheme=mode;document.documentElement.style.background=bg;}catch(e){}})();`

export const metadata: Metadata = {
  title: "Kommando — Allemand en 5 jours",
  description:
    "Programme intensif d’allemand de survie, orthographe suisse, fiches, drills et voix.",
  applicationName: "Kommando",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kommando",
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3F1EC" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="kommando-build" content="20261021-compact" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
