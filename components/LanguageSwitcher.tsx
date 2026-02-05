"use client"

import { useLanguage } from "../app/contexts/LanguageContext"
import { Button } from "./ui/button"
import { Globe, ChevronDown } from "lucide-react"

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'um', name: 'Umwero', flag: '⭕' }
]

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'rw' | 'um')}
        className="appearance-none bg-transparent border border-[#8B4513] rounded px-3 py-1 pr-8 text-sm text-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-[#8B4513] pointer-events-none" />
    </div>
  )
}


