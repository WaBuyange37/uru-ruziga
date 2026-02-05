// app/layout.tsx - UPDATED VERSION
import "../styles/globals.css"
import "../styles/umwero-font.css"
import { Inter } from 'next/font/google'
import { SiteHeader } from "../components/site-header"
import { SiteFooter } from "../components/site-footer"
import { AuthProvider } from "./contexts/AuthContext"
import { LanguageProvider } from "./contexts/LanguageContext"
import { CartProvider } from "./contexts/CartContext"
import { SettingsSidebar } from "../components/SettingsSidebar"
import { UmweroWrapper } from "../components/UmweroWrapper"

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
                <div className="flex flex-col min-h-screen">
                  <SiteHeader />
                  <div className="flex flex-grow">
                    <SettingsSidebar />
                    <main className="flex-grow overflow-auto w-full pl-12 sm:pl-16 md:pl-20 pb-16 sm:pb-0">
                      {children}
                    </main>
                  </div>
                  <SiteFooter />
                </div>
              </UmweroWrapper>
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}