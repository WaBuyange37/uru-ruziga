"use client"

import { useState } from 'react'
import { Button } from "./ui/button"
import { Settings, Globe, User, GamepadIcon } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '../app/contexts/AuthContext'
import { useLanguage } from '../app/contexts/LanguageContext'
import { useTranslation } from '../hooks/useTranslation'

const languages = [
  { code: 'en', name: 'English' },
  { code: 'rw', name: 'Kinyarwanda' },
  { code: 'um', name: 'Umwero' },
]

export function SettingsSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { user } = useAuth()
  const { language, setLanguage } = useLanguage()
  const { t } = useTranslation()

  const toggleSidebar = () => setIsExpanded(!isExpanded)

  return (
    <aside className={`fixed left-0 top-16 bottom-0 bg-[#F3E5AB] border-r border-[#8B4513] transition-all duration-300 z-40 ${isExpanded ? 'w-64' : 'w-[8%] sm:w-[20%]'}`}>
      <div className="p-4">
        <Button variant="ghost" onClick={toggleSidebar} className="w-full mb-4">
          <Settings className="h-6 w-6" />
          {isExpanded && <span className="ml-2">{t('settings')}</span>}
        </Button>
        {!isExpanded && (
          <Link href="/games-and-quizzes">
            <Button variant="ghost" className="w-full mb-4">
              <GamepadIcon className="h-6 w-6" />
            </Button>
          </Link>
        )}
        {isExpanded && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-[#8B4513] mb-2">{t('settings')}</h3>
              <Link href="/games-and-quizzes">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <GamepadIcon className="h-4 w-4 mr-2" />
                  {t('gamesAndQuizzes')}
                </Button>
              </Link>
            </div>
            <div>
              <h3 className="font-semibold text-[#8B4513] mb-2">{t('language')}</h3>
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant="ghost"
                  className={`w-full justify-start ${language === lang.code ? 'bg-[#8B4513] text-[#F3E5AB]' : ''}`}
                  onClick={() => setLanguage(lang.code as 'en' | 'rw' | 'um')}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {t(lang.code as TranslationKey)}
                </Button>
              ))}
            </div>
            <div>
              <h3 className="font-semibold text-[#8B4513] mb-2">{t('profile')}</h3>
              {user ? (
                <div className="text-[#8B4513]">
                  <p>{t('welcome')}, {user.username}!</p>
                  <Link href="/profile">
                    <Button variant="link" className="p-0 h-auto font-normal text-[#8B4513]">
                      {t('viewProfile')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    {t('logIn')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

