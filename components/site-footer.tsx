"use client"

import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '../hooks/useTranslation'

export function SiteFooter() {
  const { t } = useTranslation()

  return (
    <footer className="border-t bg-white">
      <div className="container py-8 px-64 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="mb-6 md:mb-0">
            <h3 className="font-semibold mb-4 text-[#8B4513]">{t('about')}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('welcome')}
            </p>
          </div>
          <div className="mb-6 md:mb-0">
            <h3 className="font-semibold mb-4 text-[#8B4513]">{t('quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-[#8B4513]">
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-[#8B4513]">
                  {t('termsOfService')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-[#8B4513]">
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link href="/culture-and-history" className="text-gray-600 hover:text-[#8B4513]">
                  {t('cultureAndHistory')}
                </Link>
              </li>
            </ul>
          </div>
          <div className="mb-6 md:mb-0">
            <h3 className="font-semibold mb-4 text-[#8B4513]">{t('resources')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/learn" className="text-gray-600 hover:text-[#8B4513]">
                  {t('learningMaterials')}
                </Link>
              </li>
              <li>
                <Link href="/fund" className="text-gray-600 hover:text-[#8B4513]">
                  {t('supportUs')}
                </Link>
              </li>
            </ul>
          </div>
          <div className="mb-6 md:mb-0">
            <h3 className="font-semibold mb-4 text-[#8B4513]">{t('followUs')}</h3>
            <div className="flex space-x-4">
              <a href="https://www.youtube.com/@Umwero" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#8B4513]">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/Mugisha1837" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#8B4513]">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.facebook.com/KwizeraMugisha" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#8B4513]">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/KMugisha1837" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#8B4513]">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} EraEinstain. {t('allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  )
}

