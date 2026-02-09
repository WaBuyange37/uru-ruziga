// app/layout.tsx - UPDATED VERSION
import "../styles/globals.css"
import "../styles/umwero-font.css"
import { Inter } from 'next/font/google'
import { AuthProvider } from "./contexts/AuthContext"
import { LanguageProvider } from "./contexts/LanguageContext"
import { CartProvider } from "./contexts/CartContext"
import { UmweroWrapper } from "../components/UmweroWrapper"
import LayoutContent from "../components/LayoutContent"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Umwero Learning Platform - Preserve Kinyarwanda Culture",
  description: "Learn the Umwero alphabet, a revolutionary African script created by Kwizera Mugisha to decolonize and preserve Kinyarwanda sounds. Join the cultural renaissance.",
  keywords: "Umwero, Kinyarwanda, African script, cultural preservation, language learning, Rwanda, decolonization",
  authors: [{ name: "Kwizera Mugisha" }],
  creator: "Kwizera Mugisha",
  publisher: "Umwero Movement",
  openGraph: {
    title: "Umwero Learning Platform",
    description: "Learn the revolutionary Umwero alphabet and preserve Kinyarwanda culture",
    type: "website",
    locale: "en_US",
    alternateLocale: ["rw_RW"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Umwero Learning Platform",
    description: "Learn the revolutionary Umwero alphabet and preserve Kinyarwanda culture",
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
      <body className={`${inter.className} bg-[#FFFFFF]`}>
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