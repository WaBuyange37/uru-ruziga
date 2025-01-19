import "../styles/globals.css"
import { Inter } from 'next/font/google'
import { SiteHeader } from "../components/site-header"
import { SiteFooter } from "../components/site-footer"
import { AuthProvider } from "./contexts/AuthContext"
import { LanguageProvider } from "./contexts/LanguageContext"
import { LayoutContent } from "../components/LayoutContent"

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
      <body className={`${inter.className} bg-[#FFFFFF]`}>
        <AuthProvider>
          <LanguageProvider>
            <div className="flex flex-col min-h-screen">
              <SiteHeader />
              <LayoutContent>{children}</LayoutContent>
              <SiteFooter />
            </div>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

