"use client"
// /home/nzela37/Kwizera/Projects/uru-ruziga/conexts/LanguageContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react'
// /home/nzela37/Kwizera/Projects/uru-ruziga/conexts/LanguageContext.tsx
type Language = 'en' | 'rw' | 'um'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') as Language
    if (storedLanguage) {
      setLanguage(storedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}
