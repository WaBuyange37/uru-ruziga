"use client"

import { Button } from "./ui/button"
import { Settings, Globe, User, GamepadIcon, Users, ShoppingCart, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "../app/contexts/AuthContext"
import { useLanguage } from "../app/contexts/LanguageContext"
import { useTranslation } from "../hooks/useTranslation"
import { TranslationKey } from "../lib/translations"
import { useCart } from "../app/contexts/CartContext"

const languages = [
  { code: "en", name: "English" },
  { code: "rw", name: "Kinyarwanda" },
  { code: "um", name: "Umwero" },
]

export function SettingsSidebar() {
  const { user } = useAuth()
  const { language, setLanguage } = useLanguage()
  const { t } = useTranslation()
  const { cart, totalItems, totalPrice } = useCart()

  return (
    <aside
      className="hidden md:block fixed left-0 top-16 bottom-0 bg-[#F3E5AB] border-r-2 border-[#8B4513] transition-all duration-300 z-40 w-16 hover:w-64 group shadow-md"
    >
      <div className="h-full flex flex-col items-end p-4 overflow-y-auto">
        <div className="w-full mb-4 flex justify-end items-center">
          <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#8B4513] font-semibold">{t("settings")}</span>
          <Settings className="h-6 w-6 text-[#8B4513]" />
        </div>

        {/* Collapsed Icons */}
        <div className="flex flex-col items-end space-y-4 w-full group-hover:hidden">
          <Link href="/games-and-quizzes" className="w-full">
            <Button variant="ghost" className="w-full flex justify-end hover:bg-[#D2691E] hover:text-[#F3E5AB]">
              <GamepadIcon className="h-6 w-6 text-[#8B4513]" />
            </Button>
          </Link>
          <Link href="/community" className="w-full">
            <Button variant="ghost" className="w-full flex justify-end hover:bg-[#D2691E] hover:text-[#F3E5AB]">
              <Users className="h-6 w-6 text-[#8B4513]" />
            </Button>
          </Link>
          <Link href="/cart" className="w-full relative">
            <Button variant="ghost" className="w-full flex justify-end hover:bg-[#D2691E] hover:text-[#F3E5AB]">
              <ShoppingCart className="h-6 w-6 text-[#8B4513]" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/umwero-chat" className="w-full">
            <Button variant="ghost" className="w-full flex justify-end hover:bg-[#D2691E] hover:text-[#F3E5AB]">
              <MessageCircle className="h-6 w-6 text-[#8B4513]" />
            </Button>
          </Link>
        </div>

        {/* Expanded Content */}
        <div className="hidden group-hover:block space-y-6 w-full">
          <div>
            <h3 className="font-semibold text-[#8B4513] mb-3 text-right text-sm">
              {t("settings")}
            </h3>
            <Link href="/games-and-quizzes" className="w-full">
              <Button variant="ghost" className="w-full justify-end text-sm hover:bg-[#D2691E] hover:text-[#F3E5AB] text-[#8B4513]">
                {t("gamesAndQuizzes")}
                <GamepadIcon className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/community" className="w-full">
              <Button variant="ghost" className="w-full justify-end text-sm hover:bg-[#D2691E] hover:text-[#F3E5AB] text-[#8B4513]">
                {t("community")}
                <Users className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/umwero-chat" className="w-full">
              <Button variant="ghost" className="w-full justify-end text-sm hover:bg-[#D2691E] hover:text-[#F3E5AB] text-[#8B4513]">
                {t("umweroChat")}
                <MessageCircle className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div>
            <h3 className="font-semibold text-[#8B4513] mb-3 text-right text-sm">
              {t("language")}
            </h3>
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant="ghost"
                className={`w-full justify-end text-sm ${
                  language === lang.code 
                    ? "bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]" 
                    : "hover:bg-[#D2691E] hover:text-[#F3E5AB] text-[#8B4513]"
                }`}
                onClick={() => setLanguage(lang.code as "en" | "rw" | "um")}
              >
                {t(lang.code as TranslationKey)}
                <Globe className="h-4 w-4 ml-2" />
              </Button>
            ))}
          </div>

          <div>
            <h3 className="font-semibold text-[#8B4513] mb-3 text-right text-sm">
              {t("profile")}
            </h3>
            {user ? (
              <div className="text-[#8B4513] text-right text-sm">
                <p className="mb-2">
                  {t("welcome")}, {user.fullName}!
                </p>
                <Link href="/profile">
                  <Button variant="link" className="p-0 h-auto font-normal text-[#D2691E] hover:text-[#8B4513] text-sm">
                    {t("viewProfile")}
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/login" className="w-full">
                <Button variant="ghost" className="w-full justify-end text-sm hover:bg-[#D2691E] hover:text-[#F3E5AB] text-[#8B4513]">
                  {t("logIn")}
                  <User className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-[#8B4513] mb-3 text-right text-sm">{t("cart")}</h3>
            {cart.length > 0 ? (
              <div className="text-[#8B4513] text-right text-sm">
                <p className="mb-1">{t("itemsInCart")}: {totalItems}</p>
                <p className="mb-3">
                  {t("total")}: ${totalPrice.toFixed(2)}
                </p>
                <Link href="/cart" className="w-full">
                  <Button variant="ghost" className="w-full justify-end text-sm hover:bg-[#D2691E] hover:text-[#F3E5AB] relative text-[#8B4513]">
                    {t("viewCart")}
                    <ShoppingCart className="h-4 w-4 ml-2" />
                    <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-[#D2691E] text-right text-sm">{t("cartEmpty")}</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
