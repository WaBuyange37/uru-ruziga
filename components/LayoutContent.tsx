"use client"

import { usePathname } from 'next/navigation'
import { SettingsSidebar } from "./SettingsSidebar"
import { useTranslation } from '../hooks/useTranslation'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isGalleryPage = pathname === '/gallery'
  //const { t } = useTranslation() //Removed this line

  return (
    <div className="flex flex-grow">
      {!isGalleryPage && <SettingsSidebar />}
      <main className={`flex-grow ${isGalleryPage ? 'w-full' : 'pl-[8%] sm:pl-[20%]'}`}>
        {children}
      </main>
    </div>
  )
}

