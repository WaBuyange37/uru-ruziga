"use client"

import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '../hooks/useTranslation'

export function SiteFooter() {
  const { t } = useTranslation()

  return (
    <footer className="border-t">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">{t('about')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('welcome')}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  {t('termsOfService')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link href="/culture-and-history" className="text-muted-foreground hover:text-foreground">
                  {t('cultureAndHistory')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t('resources')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/learn" className="text-muted-foreground hover:text-foreground">
                  {t('learningMaterials')}
                </Link>
              </li>
              <li>
                <Link href="/fund" className="text-muted-foreground hover:text-foreground">
                  {t('supportUs')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t('followUs')}</h3>
            <div className="flex space-x-4">
              <a href="https://www.youtube.com/@Umwero" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/Mugisha1837" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.facebook.com/KwizeraMugisha" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/KMugisha1837" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

