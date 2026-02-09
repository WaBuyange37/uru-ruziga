"use client"

import { useAuth } from "../app/contexts/AuthContext"
import { usePathname } from "next/navigation"
import { SiteHeaderNew } from "./site-header-new"
import { SiteFooter } from "./site-footer"

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  
  // Pages where header should show simplified version (no user menu)
  const isAuthPage = pathname === "/login" || pathname === "/signup"

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeaderNew />
      <main className={`flex-grow overflow-auto w-full pb-16 sm:pb-0`}>
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
