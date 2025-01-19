'use client'

import { useLanguage } from '../app/contexts/LanguageContext'
import { translations, TranslationKey } from '../app/utils/translations'

export function useTranslation() {
  const { language } = useLanguage()

  const t = (key: TranslationKey) => {
    return translations[language][key] || key
  }

  return { t, language }
}

