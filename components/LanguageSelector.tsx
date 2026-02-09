"use client"

import { Button } from './ui/button'
import { Globe } from 'lucide-react'

interface LanguageSelectorProps {
  value: string
  onChange: (language: string) => void
  compact?: boolean
}

export function LanguageSelector({ value, onChange, compact = false }: LanguageSelectorProps) {
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', short: 'EN' },
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼', short: 'RW' },
    { code: 'um', name: 'Umwero', flag: '📜', short: 'UM' },
  ]

  if (compact) {
    return (
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border-2 border-[#8B4513] rounded-lg bg-white text-[#8B4513] font-medium focus:outline-none focus:border-[#D2691E] cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-[#8B4513]" />
        <span className="text-sm text-[#8B4513] font-medium">Language:</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            onClick={() => onChange(lang.code)}
            variant={value === lang.code ? 'default' : 'outline'}
            size="sm"
            className={`${
              value === lang.code
                ? 'bg-[#8B4513] text-[#F3E5AB]'
                : 'border-2 border-[#8B4513] text-[#8B4513] bg-white'
            } hover:bg-[#A0522D] hover:text-[#F3E5AB] transition-colors`}
          >
            <span className="mr-1">{lang.flag}</span>
            <span className="hidden sm:inline">{lang.name}</span>
            <span className="sm:hidden">{lang.short}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
