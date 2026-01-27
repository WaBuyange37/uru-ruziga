// components/LanguageWrapper.tsx
'use client'

import { useLanguage } from '../app/contexts/LanguageContext'
import { ReactNode } from 'react'

export function LanguageWrapper({ children }: { children: ReactNode }) {
  const { language } = useLanguage()
  
  // Apply Umwero font globally when language is 'um'
  const fontClass = language === 'um' ? 'font-umwero' : ''
  
  return (
    <div className={fontClass}>
      {children}
    </div>
  )
}