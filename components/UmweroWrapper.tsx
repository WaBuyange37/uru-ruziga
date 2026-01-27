// components/UmweroWrapper.tsx
'use client'

import { useLanguage } from '../app/contexts/LanguageContext'
import { ReactNode, useEffect } from 'react'

/**
 * Global wrapper that applies Umwero font to entire app when lang='um'
 * Wrap your entire app content with this component
 */
export function UmweroWrapper({ children }: { children: ReactNode }) {
  const { language } = useLanguage()
  
  useEffect(() => {
    // Apply font class to body when language changes
    if (language === 'um') {
      document.body.classList.add('umwero-active')
    } else {
      document.body.classList.remove('umwero-active')
    }
  }, [language])
  
  return <>{children}</>
}