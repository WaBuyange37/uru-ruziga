"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  Menu,
  X,
  Search,
  CircleIcon,
  ChevronDown,
  LogIn,
  LogOut,
  Users,
  UserCircle,
  ShoppingCart,
  Globe,
  Gamepad,
  Settings,
  User,
} from "lucide-react"
import { useAuth } from "../app/contexts/AuthContext"
import { useCart } from "../app/contexts/CartContext"
import { useTranslation } from "../hooks/useTranslation"
import LanguageSwitcher from "./LanguageSwitcher"
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "./ui/dropdown-menu"

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()
  const { totalItems } = useCart()
  const { t } = useTranslation()

  const isAuthPage = pathname === "/login" || pathname === "/signup"

  const handleDropdownToggle = (label: string) => {
    if (openDropdown === label) {
      setOpenDropdown(null)
    } else {
      setOpenDropdown(label)
    }
  }

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
      <header className="sticky top-0 z-50 w-full border-b bg-[#F3E5AB]">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 px-2">
            <CircleIcon className="h-12 w-12 text-[#8B4513]" />
            <span className="text-2xl font-bold sm:inline-block">Uruziga</span>
          </Link>
          <nav>
            <Link href={pathname === "/login" ? "/signup" : "/login"}>
              <Button variant="ghost" className="flex items-center">
                {pathname === "/login" ? t("signup") : t("login")}
              </Button>
            </Link>
          </nav>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#F3E5AB]">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 px-2">
          <CircleIcon className="h-12 w-12 text-[#8B4513]" />
          <span className="text-2xl font-bold sm:inline-block">Uruziga</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-4 flex-1 justify-center">
          {routes.map((route) => (
            <div key={route.href || route.label} className="relative">
              {route.children ? (
                <DropdownMenu
                  trigger={
                    <button className="flex items-center px-3 py-2 text-sm font-medium text-foreground/60 hover:text-foreground/80 transition-colors">
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
                    "transition-colors hover:text-foreground/80 px-3 py-2 rounded-md text-sm font-medium",
                    pathname === route.href ? "bg-primary text-primary-foreground" : "text-foreground/60",
                  )}
                >
                  {t(route.label)}
                </Link>
              )}
            </div>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          {/* <Link href="/cart">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link> */}
          {isAuthenticated ? (
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="icon">
                  <UserCircle className="h-5 w-5" />
                </Button>
              }
            >
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
              <Button variant="ghost" size="icon">
                <LogIn className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            }
            align="right"
          >
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

