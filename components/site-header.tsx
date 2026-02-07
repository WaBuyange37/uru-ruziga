"use client"

import { useState } from "react"
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
} from "lucide-react"
import { useAuth } from "../app/contexts/AuthContext"
import { useTranslation } from "../hooks/useTranslation"
import LanguageSwitcher from "./LanguageSwitcher"
import { DropdownMenu, DropdownMenuItem } from "./ui/dropdown-menu"

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()
  const { t } = useTranslation()

  const isAuthPage = pathname === "/login" || pathname === "/signup"

  const routes = [
    { href: "/", label: "home" },
    { href: "/learn", label: "learn" },
    {
      label: "tools",
      children: [
        { href: "/games-and-quizzes", label: "gamesAndQuizzes" },
        { href: "/translate", label: "translate" },
        { href: "/calendar", label: "calendar" },
      ],
    },
    { href: "/fund", label: "fundUs" },
    { href: "/gallery", label: "gallery" },
  ]

  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-50 w-full border-b-2 border-[#8B4513] bg-[#F3E5AB] shadow-md">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
          <Link href="/" className="flex items-center space-x-2">
            <CircleIcon className="h-8 w-8 sm:h-10 sm:w-10 text-[#8B4513]" />
            <span className="text-lg sm:text-2xl font-bold text-[#8B4513]">Uruziga</span>
          </Link>
          <nav>
            <Link href={pathname === "/login" ? "/signup" : "/login"}>
              <Button variant="ghost" className="text-[#8B4513] hover:bg-[#D2691E] hover:text-[#F3E5AB] text-sm sm:text-base px-2 sm:px-4">
                {pathname === "/login" ? t("signup") : t("login")}
              </Button>
            </Link>
          </nav>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-[#8B4513] bg-[#F3E5AB] shadow-md">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 max-w-full">
        <Link href="/" className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <CircleIcon className="h-8 w-8 sm:h-10 sm:w-10 text-[#8B4513]" />
          <span className="text-lg sm:text-2xl font-bold text-[#8B4513]">Uruziga</span>
        </Link>
        
        <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center mx-4">
          {routes.map((route) => (
            <div key={route.href || route.label} className="relative">
              {route.children ? (
                <DropdownMenu
                  trigger={
                    <button className="flex items-center px-2 xl:px-3 py-2 text-sm font-medium text-[#8B4513] hover:bg-[#D2691E] hover:text-[#F3E5AB] rounded-md transition-colors whitespace-nowrap">
                      {t(route.label)}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </button>
                  }
                >
                  {route.children.map((child) => (
                    <DropdownMenuItem key={child.href}>
                      <Link href={child.href} className="block w-full">
                        {t(child.label)}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenu>
              ) : (
                <Link
                  href={route.href}
                  className={cn(
                    "transition-colors hover:bg-[#D2691E] hover:text-[#F3E5AB] px-2 xl:px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap",
                    pathname === route.href 
                      ? "bg-[#8B4513] text-[#F3E5AB]" 
                      : "text-[#8B4513]",
                  )}
                >
                  {t(route.label)}
                </Link>
              )}
            </div>
          ))}
        </nav>
        
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          
          {isAuthenticated ? (
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="icon" className="hover:bg-[#D2691E] hover:text-[#F3E5AB] h-9 w-9 sm:h-10 sm:w-10">
                  <UserCircle className="h-5 w-5 text-[#8B4513]" />
                </Button>
              }
            >
              <DropdownMenuItem>
                <Link href="/dashboard" className="flex items-center w-full">
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/profile" className="flex items-center w-full">
                  <User className="mr-2 h-4 w-4" />
                  {t("profile")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t("logout")}
              </DropdownMenuItem>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon" className="hover:bg-[#D2691E] hover:text-[#F3E5AB] h-9 w-9 sm:h-10 sm:w-10">
                <LogIn className="h-5 w-5 text-[#8B4513]" />
              </Button>
            </Link>
          )}
          
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="icon" className="lg:hidden hover:bg-[#D2691E] hover:text-[#F3E5AB] h-9 w-9 sm:h-10 sm:w-10">
                <Menu className="h-5 w-5 text-[#8B4513]" />
              </Button>
            }
            align="right"
          >
            <div className="sm:hidden px-4 py-2 border-b border-[#8B4513]">
              <LanguageSwitcher />
            </div>
            {routes.map((route) =>
              route.children ? (
                <DropdownMenuItem key={route.label}>
                  <DropdownMenu
                    trigger={
                      <button className="flex items-center w-full">
                        {t(route.label)}
                        <ChevronDown className="ml-auto h-4 w-4" />
                      </button>
                    }
                  >
                    {route.children.map((child) => (
                      <DropdownMenuItem key={child.href}>
                        <Link href={child.href} className="block w-full">
                          {t(child.label)}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenu>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem key={route.href}>
                  <Link href={route.href} className="block w-full">
                    {t(route.label)}
                  </Link>
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
