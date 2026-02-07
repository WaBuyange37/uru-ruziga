"use client"

import { useAuth } from "../app/contexts/AuthContext"
import { usePathname } from "next/navigation"
import { SiteHeader } from "./site-header"
import { SiteFooter } from "./site-footer"
import { SettingsSidebar } from "./SettingsSidebar"

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  
  // Pages where sidebar should not show even if logged in
  const noSidebarPages = ['/login', '/signup', '/forgot-password']
  const showSidebar = isAuthenticated && !noSidebarPages.includes(pathname)

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <div className="flex flex-grow">
        {showSidebar && <SettingsSidebar />}
        <main className={`flex-grow overflow-auto w-full pb-16 sm:pb-0 ${showSidebar ? 'pl-16' : ''}`}>
          {children}
        </main>
      </div>
      <SiteFooter />
    </div>
  )
}
