// components/site-header-modern.tsx
// Modern Ed-Tech Platform Header - Refactored for scalability and clean design

"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
  Settings,
  ShoppingCart,
  MessageCircle,
  X,
  BookOpen,
  Users,
  GamepadIcon,
  Globe,
  LayoutDashboard,
  Palette,
} from "lucide-react"
import { useAuth } from "../app/contexts/AuthContext"
import { useTranslation } from "../hooks/useTranslation"
import LanguageSwitcher from "./LanguageSwitcher"
import { useCart } from "../app/contexts/CartContext"

type DropdownId = "tools" | "profile" | "mobile" | null

export function SiteHeaderModern() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()
  const { t } = useTranslation()
  const { totalItems } = useCart()
  
  // Unified dropdown state
  const [openDropdown, setOpenDropdown] = useState<DropdownId>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mobileDrawerRef = useRef<HTMLDivElement>(null)

  const isAuthPage = pathname === "/login" || pathname === "/signup"

  // Navigation routes
  const routes = [
    { href: "/", label: "home", icon: CircleIcon },
    { href: "/learn", label: "learn", icon: BookOpen },
    {
      id: "tools",
      label: "tools",
      icon: Settings,
      children: [
        { href: "/games-and-quizzes", label: "gamesAndQuizzes", icon: GamepadIcon },
        { href: "/translate", label: "translate", icon: Globe },
        { href: "/umwero-chat", label: "umweroChat", icon: MessageCircle },
        { href: "/gallery", label: "Ubugeni", icon: Palette },
      ],
    },
    { href: "/community", label: "community", icon: Users },
    { href: "/fund", label: "fundUs", icon: CircleIcon },
  ]

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }

    if (openDropdown && openDropdown !== "mobile") {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [openDropdown])

  // Close mobile drawer on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openDropdown === "mobile") {
        setOpenDropdown(null)
      }
    }

    if (openDropdown === "mobile") {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
      return () => {
        document.removeEventListener("keydown", handleEscape)
        document.body.style.overflow = "unset"
      }
    }
  }, [openDropdown])

  const toggleDropdown = (id: DropdownId) => {
    setOpenDropdown(openDropdown === id ? null : id)
  }

  const closeDropdown = () => setOpenDropdown(null)

  const handleLogout = () => {
    logout()
    closeDropdown()
    router.push("/")
  }

  // Simplified auth page header
  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-neutral-200 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2 group">
            <CircleIcon className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold text-foreground">Uruziga</span>
          </Link>
          <nav>
            <Link href={pathname === "/login" ? "/signup" : "/login"}>
              <Button variant="ghost" className="text-sm font-medium">
                {pathname === "/login" ? "Sign Up" : "Log In"}
              </Button>
            </Link>
          </nav>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-neutral-200 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group flex-shrink-0">
            <CircleIcon className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold text-foreground">Uruziga</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center mx-8">
            {routes.map((route) => {
              if (route.children) {
                return (
                  <div key={route.id} className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => toggleDropdown(route.id as DropdownId)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        "hover:bg-neutral-100 hover:text-neutral-900",
                        openDropdown === route.id ? "bg-neutral-100 text-neutral-900" : "text-neutral-600"
                      )}
                      aria-expanded={openDropdown === route.id}
                      aria-haspopup="true"
                    >
                      {t(route.label as any)}
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        openDropdown === route.id && "rotate-180"
                      )} />
                    </button>

                    {/* Dropdown Menu */}
                    {openDropdown === route.id && (
                      <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white border border-neutral-200 shadow-lg animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                        <div className="py-1" role="menu">
                          {route.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={closeDropdown}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                              role="menuitem"
                            >
                              {child.icon && <child.icon className="h-4 w-4 text-neutral-500" />}
                              {t(child.label as any)}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    "hover:bg-neutral-100 hover:text-neutral-900",
                    pathname === route.href
                      ? "text-primary font-semibold"
                      : "text-neutral-600"
                  )}
                  aria-current={pathname === route.href ? "page" : undefined}
                >
                  {t(route.label as any)}
                </Link>
              )
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Language Switcher - Desktop */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative h-10 w-10">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleDropdown("profile")}
                  className="h-10 w-10"
                  aria-expanded={openDropdown === "profile"}
                  aria-haspopup="true"
                >
                  <UserCircle className="h-5 w-5" />
                </Button>

                {/* Profile Dropdown */}
                {openDropdown === "profile" && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {/* User Info */}
                    <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
                      <p className="text-sm font-semibold text-neutral-900">{(user as any)?.name || (user as any)?.username || "User"}</p>
                      <p className="text-xs text-neutral-500 truncate">{(user as any)?.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1" role="menu">
                      <Link
                        href="/dashboard"
                        onClick={closeDropdown}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                        role="menuitem"
                      >
                        <LayoutDashboard className="h-4 w-4 text-neutral-500" />
                        {t("dashboard")}
                      </Link>
                      <Link
                        href="/profile"
                        onClick={closeDropdown}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                        role="menuitem"
                      >
                        <User className="h-4 w-4 text-neutral-500" />
                        {t("profile")}
                      </Link>
                      <Link
                        href="/settings"
                        onClick={closeDropdown}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                        role="menuitem"
                      >
                        <Settings className="h-4 w-4 text-neutral-500" />
                        {t("settings")}
                      </Link>
                      <div className="border-t border-neutral-200 my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4" />
                        {t("logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <LogIn className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleDropdown("mobile")}
              className="lg:hidden h-10 w-10"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {openDropdown === "mobile" && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={closeDropdown}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div
            ref={mobileDrawerRef}
            className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl border-l border-neutral-200 z-50 lg:hidden overflow-y-auto animate-in slide-in-from-right duration-300"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <span className="text-lg font-semibold text-neutral-900">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeDropdown}
                className="h-10 w-10"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* User Info (if authenticated) */}
            {isAuthenticated && user && (
              <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
                <p className="text-sm font-semibold text-neutral-900">{(user as any).name || (user as any).username || "User"}</p>
                <p className="text-xs text-neutral-500 truncate">{(user as any).email}</p>
              </div>
            )}

            {/* Navigation */}
            <nav className="px-6 py-4 space-y-1">
              {routes.map((route) => {
                if (route.children) {
                  return (
                    <div key={route.id} className="space-y-1">
                      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 py-2">
                        {t(route.label as any)}
                      </div>
                      {route.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={closeDropdown}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors min-h-[44px]"
                        >
                          {child.icon && <child.icon className="h-5 w-5 text-neutral-500" />}
                          {t(child.label as any)}
                        </Link>
                      ))}
                    </div>
                  )
                }

                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={closeDropdown}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors min-h-[44px]",
                      pathname === route.href
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-neutral-700 hover:bg-neutral-100"
                    )}
                  >
                    {route.icon && <route.icon className="h-5 w-5" />}
                    {t(route.label as any)}
                  </Link>
                )
              })}
            </nav>

            {/* Language Switcher - Mobile */}
            <div className="px-6 py-4 border-t border-neutral-200">
              <LanguageSwitcher />
            </div>

            {/* Auth Actions */}
            <div className="px-6 py-4 border-t border-neutral-200 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" onClick={closeDropdown}>
                    <Button variant="outline" className="w-full justify-start gap-3 min-h-[44px]">
                      <LayoutDashboard className="h-5 w-5" />
                      {t("dashboard")}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 min-h-[44px]"
                  >
                    <LogOut className="h-5 w-5" />
                    {t("logout")}
                  </Button>
                </>
              ) : (
                <Link href="/login" onClick={closeDropdown}>
                  <Button className="w-full justify-start gap-3 min-h-[44px]">
                    <LogIn className="h-5 w-5" />
                    Log In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
