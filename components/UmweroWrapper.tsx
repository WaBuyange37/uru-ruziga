// components/UmweroWrapper.tsx
'use client'

import { useLanguage } from '../app/contexts/LanguageContext'
import { ReactNode, useEffect } from 'react'

/**
 * Global wrapper that applies Umwero font and language-specific styling
 * Wrap your entire app content with this component
 */
export function UmweroWrapper({ children }: { children: ReactNode }) {
  const { language } = useLanguage()
  
  useEffect(() => {
    // Apply language-specific classes and data attributes
    document.documentElement.setAttribute('data-language', language)
    document.body.setAttribute('data-language', language)
    
    if (language === 'um') {
      document.body.classList.add('umwero-active')
      document.documentElement.style.setProperty('--font-family-primary', "'Umwero', 'UmweroPUA', monospace")
    } else {
      document.body.classList.remove('umwero-active')
      document.documentElement.style.removeProperty('--font-family-primary')
    }
    
    // Update page direction for RTL languages if needed (Umwero is LTR)
    document.documentElement.dir = 'ltr'
  }, [language])
  
  return (
    <div data-language={language} className={language === 'um' ? 'umwero-text' : ''}>
      {children}
    </div>
  )
}