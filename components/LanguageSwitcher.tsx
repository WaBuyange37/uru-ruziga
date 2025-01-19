'use client'

import { useLanguage } from '../app/contexts/LanguageContext'
import { Select } from './ui/select'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <Select
      value={language}
      onValueChange={setLanguage}
      options={[
        { value: 'en', label: 'English' },
        { value: 'rw', label: 'Kinyarwanda' },
        { value: 'um', label: 'Umwero' },
      ]}
    />
  )
}


