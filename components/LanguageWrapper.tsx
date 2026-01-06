// Create: components/LanguageWrapper.tsx

"use client"
import { useLanguage } from '../conexts/LanguageContext'
import { useEffect } from 'react'

export function LanguageWrapper({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage()

  useEffect(() => {
    try {
      // Set data attribute on body for CSS targeting
      document.body.setAttribute('data-language', language)
      document.documentElement.setAttribute('data-language', language)
      
      // Add/remove umwero class for easier styling
      if (language === 'um') {
        document.body.classList.add('umwero-mode')
      } else {
        document.body.classList.remove('umwero-mode')
      }
      
      console.log('Language changed to:', language) // Debug log
    } catch (error) {
      console.error('LanguageWrapper error:', error)
    }
  }, [language])

  return <>{children}</>
}