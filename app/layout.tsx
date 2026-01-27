// app/layout.tsx - UPDATED VERSION
import "../styles/globals.css"
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
  title: "Uruziga - Learn Umwero Alphabet",
  description: "Preserve and learn the Umwero alphabet, a unique cultural heritage.",
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