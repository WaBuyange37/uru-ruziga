// app/layout.tsx - UPDATED VERSION
import "../styles/globals.css"
import "../styles/umwero-font.css"
import { AuthProvider } from "./contexts/AuthContext"
import { LanguageProvider } from "./contexts/LanguageContext"
import { CartProvider } from "./contexts/CartContext"
import { UmweroWrapper } from "../components/UmweroWrapper"
import LayoutContent from "../components/LayoutContent"
import { kbSeo } from "../lib/umwero-knowledge-base"
import { warnAboutRuntimeConfig } from "../lib/runtime-env"

export const metadata = {
  title: kbSeo.siteTitle,
  description: kbSeo.siteDescription,
  keywords: "Umwero, Kinyarwanda, Uruziga, Rwandan culture, linguistic heritage, writing system",
  authors: [{ name: "Kwizera Mugisha" }],
  creator: "Kwizera Mugisha",
  publisher: "Uruziga",
  openGraph: {
    title: kbSeo.siteTitle,
    description: kbSeo.siteDescription,
    type: "website",
    locale: "en_US",
    alternateLocale: ["rw_RW"],
  },
  twitter: {
    card: "summary_large_image",
    title: kbSeo.siteTitle,
    description: kbSeo.siteDescription,
    creator: "@Mugisha1837",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  warnAboutRuntimeConfig()

  return (
    <html lang="en">
      <head>
        {/* Preload Umwero font for faster rendering */}
        <link
          rel="preload"
          href="/fonts/Umwero.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-[#FFFFFF]">
        <AuthProvider>
          <LanguageProvider>
            <CartProvider>
              <UmweroWrapper>
                <LayoutContent>{children}</LayoutContent>
              </UmweroWrapper>
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
