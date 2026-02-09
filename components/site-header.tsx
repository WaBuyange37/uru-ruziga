"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import {
  Menu,
  CircleIcon,
  ChevronDown,
  LogIn,
  LogOut,
  UserCircle,
  User,
  ShoppingCart,
  X,
  Settings,
  LayoutDashboard
} from "lucide-react"
import { useAuth } from "../app/contexts/AuthContext"
import { useCart } from "../app/contexts/CartContext"
import { useTranslation } from "../hooks/useTranslation"
import LanguageSwitcher from "./LanguageSwitcher"

export function SiteHeader() {
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()
  const { totalItems } = useCart()
  const { t } = useTranslation()
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false)
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  
  const toolsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const isAuthPage = pathname === "/login" || pathname === "/signup"

  const routes = [
    { href: "/", label: "home" },
    { href: "/learn", label: "learn" },
    {
      label: "tools",
      children: [
        { href: "/games-and-quizzes", label: "gamesAndQuizzes" },
        { href: "/translate", label: "translate" },
        { href: "/umwero-chat", label: "umweroChat" },
      ],
    },
    { href: "/community", label: "community" },
    { href: "/fund", label: "fundUs" },
    { href: "/gallery", label: "gallery" },
  ]

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setToolsDropdownOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setToolsDropdownOpen(false)
    setMobileToolsOpen(false)
    setProfileDropdownOpen(false)
  }, [pathname])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false)
        setMobileToolsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  // Handle Escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
        setProfileDropdownOpen(false)
        setToolsDropdownOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-40 w-full border-b-2 border-[#8B4513] bg-[#F3E5AB] shadow-md">
        <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <CircleIcon className="h-8 w-8 sm:h-10 sm:w-10 text-[#8B4513]" />
            <span className="text-xl sm:text-2xl font-bold text-[#8B4513]">Uruziga</span>
          </Link>
          <nav className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <Link href={pathname === "/login" ? "/signup" : "/login"}>
              <Button variant="ghost" className="text-[#8B4513] hover:bg-[#D2691E] hover:text-[#F3E5AB] text-sm sm:text-base">
                {pathname === "/login" ? t("signUp") : t("logIn")}
              </Button>
            </Link>
          </nav>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b-2 border-[#8B4513] bg-[#F3E5AB] shadow-md max-w-full overflow-hidden">
        <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-4 lg:px-6 max-w-7xl">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0 min-w-0 z-10">
            <CircleIcon className="h-7 w-7 sm:h-9 sm:w-9 text-[#8B4513] flex-shrink-0" />
            <span className="text-base sm:text-lg lg:text-xl font-bold text-[#8B4513] truncate">Uruziga</span>
          </Link>
          
          {/* Desktop Navigation - Hidden on mobile/tablet */}
          <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center mx-4">
            {routes.map((route) => (
              <div key={route.href || route.label} className="relative">
                {route.children ? (
                  <div className="relative" ref={toolsRef}>
                    <button 
                      className="flex items-center px-3 py-2 text-sm font-medium text-[#8B4513] hover:bg-[#D2691E] hover:text-[#F3E5AB] rounded-md transition-colors"
                      onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                      aria-expanded={toolsDropdownOpen}
                      aria-haspopup="true"
                    >
                      {t(route.label as any)}
                      <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform duration-200", toolsDropdownOpen && "rotate-180")} />
                    </button>
                    {toolsDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-52 bg-white border-2 border-[#8B4513] rounded-md shadow-xl py-1 z-60">
                        {route.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm text-[#8B4513] hover:bg-[#F3E5AB] transition-colors"
                            onClick={() => setToolsDropdownOpen(false)}
                          >
                            {t(child.label as any)}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={route.href}
                    className={cn(
                      "transition-colors hover:bg-[#D2691E] hover:text-[#F3E5AB] px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap",
                      pathname === route.href 
                        ? "bg-[#8B4513] text-[#F3E5AB]" 
                        : "text-[#8B4513]",
                    )}
                  >
                    {t(route.label as any)}
                  </Link>
                )}
              </div>
            ))}
          </nav>
          
          {/* Right Side Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 z-10">
            {/* Language Switcher - Desktop only (hidden on tablet/mobile) */}
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>
            
            {/* Cart Icon */}
            {isAuthenticated && (
              <Link href="/cart" className="flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative hover:bg-[#D2691E] hover:text-[#F3E5AB] h-10 w-10 sm:h-11 sm:w-11 min-w-[2.5rem] min-h-[2.5rem]"
                  aria-label={`Cart with ${totalItems} items`}
                >
                  <ShoppingCart className="h-5 w-5 text-[#8B4513]" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </Button>
              </Link>
            )}
            
            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative flex-shrink-0" ref={profileRef}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-[#D2691E] hover:text-[#F3E5AB] h-9 w-9 sm:h-10 sm:w-10"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                  aria-label="User profile menu"
                >
                  <UserCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#8B4513]" />
                </Button>
                {profileDropdownOpen && (
                  <>
                    {/* Backdrop for mobile - closes dropdown when clicking outside */}
                    <div 
                      className="fixed inset-0 z-40 lg:hidden" 
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 lg:w-56 bg-white border-2 border-[#8B4513] rounded-md shadow-2xl py-1 z-50 max-h-[calc(100vh-5rem)] overflow-y-auto">
                      <div className="px-4 py-3 border-b border-[#8B4513] bg-[#F3E5AB]/30">
                        <p className="text-sm font-semibold text-[#8B4513] truncate">{user?.fullName}</p>
                        <p className="text-xs text-gray-600 truncate mt-0.5">{user?.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-3 text-sm text-[#8B4513] hover:bg-[#F3E5AB] transition-colors active:bg-[#D2691E] active:text-[#F3E5AB]"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <LayoutDashboard className="mr-3 h-4 w-4 flex-shrink-0" />
                        <span>{t("dashboard")}</span>
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-3 text-sm text-[#8B4513] hover:bg-[#F3E5AB] transition-colors active:bg-[#D2691E] active:text-[#F3E5AB]"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Settings className="mr-3 h-4 w-4 flex-shrink-0" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
                        <Link
                          href="/teacher"
                          className="flex items-center px-4 py-3 text-sm text-[#8B4513] hover:bg-[#F3E5AB] transition-colors active:bg-[#D2691E] active:text-[#F3E5AB]"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <User className="mr-3 h-4 w-4 flex-shrink-0" />
                          <span>Teacher Portal</span>
                        </Link>
                      )}
                      <div className="border-t border-[#8B4513] my-1"></div>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          logout()
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors active:bg-red-100"
                      >
                        <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
                        <span>{t("logout")}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login" className="flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-[#D2691E] hover:text-[#F3E5AB] h-9 w-9 sm:h-10 sm:w-10"
                  aria-label="Log in"
                >
                  <LogIn className="h-4 w-4 sm:h-5 sm:w-5 text-[#8B4513]" />
                </Button>
              </Link>
            )}
            
            {/* Hamburger Menu Button - Visible on mobile/tablet only */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden hover:bg-[#D2691E] hover:text-[#F3E5AB] h-10 w-10 sm:h-11 sm:w-11 min-w-[2.5rem] min-h-[2.5rem] flex-shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              <div className="relative w-5 h-5">
                <Menu 
                  className={cn(
                    "h-5 w-5 text-[#8B4513] absolute inset-0 transition-all duration-300",
                    mobileMenuOpen ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
                  )} 
                />
                <X 
                  className={cn(
                    "h-5 w-5 text-[#8B4513] absolute inset-0 transition-all duration-300",
                    mobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
                  )} 
                />
              </div>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay & Drawer */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      >
        <div 
          ref={mobileMenuRef}
          className={cn(
            "fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-[#F3E5AB] shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          {/* Mobile Menu Header */}
          <div className="sticky top-0 z-10 bg-[#F3E5AB] border-b-2 border-[#8B4513] px-4 py-4 flex items-center justify-between">
            <span className="text-lg font-bold text-[#8B4513]">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:bg-[#D2691E] hover:text-[#F3E5AB] h-10 w-10"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-[#8B4513]" />
            </Button>
          </div>

          {/* Mobile Menu Content */}
          <nav className="px-4 py-4 space-y-1">
            {/* Language Switcher - Mobile */}
            <div className="pb-3 mb-2 border-b-2 border-[#8B4513]">
              <LanguageSwitcher />
            </div>
            
            {/* Navigation Links */}
            {routes.map((route) =>
              route.children ? (
                <div key={route.label} className="space-y-1">
                  <button 
                    className="flex items-center justify-between w-full px-4 py-3 text-base font-medium text-[#8B4513] hover:bg-[#D2691E] hover:text-[#F3E5AB] rounded-md transition-colors min-h-[44px]"
                    onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
                    aria-expanded={mobileToolsOpen}
                  >
                    <span>{t(route.label as any)}</span>
                    <ChevronDown className={cn("h-5 w-5 transition-transform duration-200", mobileToolsOpen && "rotate-180")} />
                  </button>
                  {mobileToolsOpen && (
                    <div className="pl-4 space-y-1 bg-[#F5E9C3] rounded-md py-2">
                      {route.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-3 text-sm text-[#8B4513] hover:bg-[#D2691E] hover:text-[#F3E5AB] rounded-md transition-colors min-h-[44px] flex items-center"
                          onClick={() => {
                            setMobileMenuOpen(false)
                            setMobileToolsOpen(false)
                          }}
                        >
                          {t(child.label as any)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "block px-4 py-3 text-base font-medium rounded-md transition-colors min-h-[44px] flex items-center",
                    pathname === route.href 
                      ? "bg-[#8B4513] text-[#F3E5AB] border-l-4 border-[#D2691E]" 
                      : "text-[#8B4513] hover:bg-[#D2691E] hover:text-[#F3E5AB]",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t(route.label as any)}
                </Link>
              ),
            )}
          </nav>
        </div>
      </div>
    </>
  )
}
