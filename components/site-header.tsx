"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Menu, X, Search, CircleIcon, ChevronDown, LogIn, LogOut, Users } from 'lucide-react'
import { useAuth } from '../app/contexts/AuthContext'
import { useTranslation } from '../hooks/useTranslation'

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { t } = useTranslation()

  const handleDropdownToggle = (label: string) => {
    if (openDropdown === label) {
      setOpenDropdown(null)
    } else {
      setOpenDropdown(label)
    }
  }

  const routes = [
    { href: '/', label: 'home' },
    { href: '/learn', label: 'learn' },
    {
      label: 'tools',
      children: [
        { href: '/games-and-quizzes', label: 'gamesAndQuizzes' },
        { href: '/translate', label: 'translate' },
        { href: '/calendar', label: 'calendar' },
        { href: '/community', label: 'community' },
      ],
    },
    { href: '/fund', label: 'fundUs' },
    { href: '/gallery', label: 'gallery' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#F3E5AB]">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 px-2">
          <CircleIcon className="h-6 w-6 text-[#8B4513]" />
          <span className="text-2xl font-bold sm:inline-block">Uruziga</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-4 flex-1 justify-center">
          {routes.map((route) => (
            <div key={route.href || route.label} className="relative">
              {route.children ? (
                <>
                  <button
                    onClick={() => handleDropdownToggle(route.label)}
                    className="flex items-center px-3 py-2 text-sm font-medium text-foreground/60 hover:text-foreground/80 transition-colors"
                  >
                    {t(route.label)}
                    <ChevronDown className={`ml-1 h-3 w-3 transition duration-200 ${openDropdown === route.label ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === route.label && (
                    <div className="absolute top-full left-0 w-48 bg-background rounded-md shadow-lg">
                      <ul className="py-2">
                        {route.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block px-4 py-2 text-sm text-foreground/60 hover:text-foreground/80 hover:bg-accent flex items-center"
                              onClick={() => setOpenDropdown(null)}
                            >
                              {child.label === 'community' && <Users className="h-4 w-4 mr-2" />}
                              {t(child.label)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={route.href}
                  className={cn(
                    "transition-colors hover:text-foreground/80 px-3 py-2 rounded-md text-sm font-medium",
                    pathname === route.href ? "bg-primary text-primary-foreground" : "text-foreground/60"
                  )}
                >
                  {t(route.label)}
                </Link>
              )}
            </div>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('search')}
              className="pl-8 w-[200px] md:w-[300px]"
            />
          </div>
          {user ? (
            <Button variant="ghost" onClick={logout} className="flex items-center">
              <LogOut className="mr-2 h-4 w-4" />
              {t('logout')}
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="ghost" className="flex items-center">
                <LogIn className="mr-2 h-4 w-4" />
                {t('logIn')}
              </Button>
            </Link>
          )}
          <Button variant="ghost" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="container md:hidden">
          <nav className="flex flex-col space-y-3 py-4">
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('search')}
                className="pl-8 w-full"
              />
            </div>
            {routes.map((route) => (
              <div key={route.href || route.label}>
                {route.children ? (
                  <>
                    <div className="font-medium text-foreground/80 px-3 py-2">{t(route.label)}</div>
                    <div className="pl-6 space-y-2">
                      {route.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block text-foreground/60 hover:text-foreground/80 px-3 py-1 rounded-md flex items-center"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {child.label === 'community' && <Users className="h-4 w-4 mr-2" />}
                          {t(child.label)}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={route.href}
                    className={cn(
                      "transition-colors hover:text-foreground/80 px-3 py-2 rounded-md",
                      pathname === route.href ? "bg-primary text-primary-foreground" : "text-foreground/60"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t(route.label)}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

