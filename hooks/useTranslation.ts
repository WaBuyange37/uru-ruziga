'use client'

import { useLanguage } from '../app/contexts/LanguageContext'
import { translations, TranslationKey } from '../app/utils/translations'

export function useTranslation() {
  const { language } = useLanguage()

  const t = (key: TranslationKey) => {
    return translations[language][key] || key
  }

  const isUmwero = language === 'um'
  
  const getLanguageStyle = () => {
    return isUmwero ? 'umwero-font' : ''
  }

  return { t, language, isUmwero, getLanguageStyle }
}