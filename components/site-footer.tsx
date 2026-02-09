"use client"

import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '../hooks/useTranslation'

export function SiteFooter() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t-2 border-[#8B4513] bg-[#F3E5AB] mt-auto w-full">
      <div className="w-full mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* About Section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#8B4513] flex items-center justify-center flex-shrink-0">
                <span className="text-[#F3E5AB] font-bold text-lg sm:text-xl">U</span>
              </div>
              <h3 className="font-bold text-base sm:text-lg text-[#8B4513]">Uruziga</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#D2691E] leading-relaxed">
              Preserving and promoting the Umwero alphabet - a revolutionary African script for Kinyarwanda culture.
            </p>
            {/* Social Links */}
            <div className="flex gap-2 sm:gap-3 pt-2">
              <a 
                href="https://www.youtube.com/@Umwero" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#8B4513] flex items-center justify-center text-[#F3E5AB] hover:bg-[#A0522D] transition-colors flex-shrink-0"
                aria-label="YouTube"
              >
                <Youtube className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </a>
              <a 
                href="https://twitter.com/Mugisha1837" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#8B4513] flex items-center justify-center text-[#F3E5AB] hover:bg-[#A0522D] transition-colors flex-shrink-0"
                aria-label="Twitter"
              >
                <Twitter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </a>
              <a 
                href="https://www.facebook.com/KwizeraMugisha" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#8B4513] flex items-center justify-center text-[#F3E5AB] hover:bg-[#A0522D] transition-colors flex-shrink-0"
                aria-label="Facebook"
              >
                <Facebook className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </a>
              <a 
                href="https://www.instagram.com/KMugisha1837" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#8B4513] flex items-center justify-center text-[#F3E5AB] hover:bg-[#A0522D] transition-colors flex-shrink-0"
                aria-label="Instagram"
              >
                <Instagram className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-[#8B4513] mb-3 sm:mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link 
                  href="/learn" 
                  className="text-xs sm:text-sm text-[#D2691E] hover:text-[#8B4513] transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">{t('learningMaterials')}</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/fund" 
                  className="text-xs sm:text-sm text-[#D2691E] hover:text-[#8B4513] transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">{t('supportUs')}</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/gallery" 
                  className="text-xs sm:text-sm text-[#D2691E] hover:text-[#8B4513] transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">Gallery</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/culture-and-history" 
                  className="text-xs sm:text-sm text-[#D2691E] hover:text-[#8B4513] transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">{t('cultureAndHistory')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-[#8B4513] mb-3 sm:mb-4">Legal</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-xs sm:text-sm text-[#D2691E] hover:text-[#8B4513] transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">{t('privacyPolicy')}</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-xs sm:text-sm text-[#D2691E] hover:text-[#8B4513] transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">{t('termsOfService')}</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-xs sm:text-sm text-[#D2691E] hover:text-[#8B4513] transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">{t('contact')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-[#8B4513] mb-3 sm:mb-4">Contact</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start gap-2 sm:gap-3">
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#8B4513] mt-0.5 flex-shrink-0" />
                <a 
                  href="mailto:37nzela@gmail.com" 
                  className="text-xs sm:text-sm text-[#D2691E] hover:text-[#8B4513] transition-colors break-all"
                >
                  37nzela@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#8B4513] mt-0.5 flex-shrink-0" />
                <a 
                  href="tel:+250786375052" 
                  className="text-xs sm:text-sm text-[#D2691E] hover:text-[#8B4513] transition-colors"
                >
                  +250 786 375 052
                </a>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#8B4513] mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-[#D2691E]">
                  Kigali, Rwanda
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t-2 border-[#8B4513] pt-4 sm:pt-6 mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-[#D2691E] text-center sm:text-left">
              &copy; {currentYear} EraEinstain. {t('allRightsReserved')}
            </p>
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[#D2691E]">
              <span>Made with ❤️ in Rwanda</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
