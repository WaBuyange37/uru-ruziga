"use client"

import { useLanguage } from "../app/contexts/LanguageContext"
import { ChevronDown } from "lucide-react"

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', shortName: 'EN' },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼', shortName: 'RW' },
  { code: 'um', name: 'Umwero', flag: '⭕', shortName: 'UM' }
]

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

  return (
    <div className="relative w-full sm:w-auto">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'rw' | 'um')}
        className="appearance-none bg-white/50 hover:bg-white/80 border-2 border-[#8B4513] rounded-md px-2.5 sm:px-3 py-1.5 sm:py-2 pr-8 sm:pr-9 text-xs sm:text-sm font-medium text-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:bg-white transition-all cursor-pointer w-full sm:w-auto"
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 sm:right-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-[#8B4513] pointer-events-none" />
    </div>
  )
}


