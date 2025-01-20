"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Settings, Globe, User, GamepadIcon, Users, ShoppingCart, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "../app/contexts/AuthContext"
import { useLanguage } from "../app/contexts/LanguageContext"
import { useTranslation } from "../hooks/useTranslation"
import { useCart } from "../app/contexts/CartContext"

const languages = [
  { code: "en", name: "English" },
  { code: "rw", name: "Kinyarwanda" },
  { code: "um", name: "Umwero" },
]

export function SettingsSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { user } = useAuth()
  const { language, setLanguage } = useLanguage()
  const { t } = useTranslation()
  const { cart, totalItems, totalPrice } = useCart()

  const toggleSidebar = () => setIsExpanded(!isExpanded)

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 bg-[#F3E5AB] border-r border-[#8B4513] transition-all duration-300 z-40 ${isExpanded ? "w-64" : "w-12 sm:w-16 md:w-20"}`}
    >
      <div className="h-full flex flex-col items-end p-2 sm:p-4 overflow-y-auto">
        <Button variant="ghost" onClick={toggleSidebar} className="w-full mb-2 sm:mb-4 flex justify-end items-center">
          {isExpanded && <span className="mr-2">{t("settings")}</span>}
          <Settings className="h-4 w-4 sm:h-6 sm:w-6" />
        </Button>
        {!isExpanded ? (
          <div className="flex flex-col items-end space-y-2 sm:space-y-4 w-full">
            <Link href="/games-and-quizzes" className="w-full">
              <Button variant="ghost" className="w-full flex justify-end">
                <GamepadIcon className="h-4 w-4 sm:h-6 sm:w-6" />
              </Button>
            </Link>
            <Link href="/community" className="w-full">
              <Button variant="ghost" className="w-full flex justify-end">
                <Users className="h-4 w-4 sm:h-6 sm:w-6" />
              </Button>
            </Link>
            <Link href="/cart" className="w-full relative">
              <Button variant="ghost" className="w-full flex justify-end">
                <ShoppingCart className="h-4 w-4 sm:h-6 sm:w-6" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1 py-0.5">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/umwero-chat" className="w-full">
              <Button variant="ghost" className="w-full flex justify-end">
                <MessageCircle className="h-4 w-4 sm:h-6 sm:w-6" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-4 w-full">
            <div>
              <h3 className="font-semibold text-[#8B4513] mb-1 sm:mb-2 text-right text-xs sm:text-sm">
                {t("settings")}
              </h3>
              <Link href="/games-and-quizzes" className="w-full">
                <Button variant="ghost" className="w-full justify-end text-xs sm:text-sm">
                  {t("gamesAndQuizzes")}
                  <GamepadIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                </Button>
              </Link>
              <Link href="/community" className="w-full">
                <Button variant="ghost" className="w-full justify-end text-xs sm:text-sm">
                  {t("community")}
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                </Button>
              </Link>
              <Link href="/umwero-chat" className="w-full">
                <Button variant="ghost" className="w-full justify-end text-xs sm:text-sm">
                  {t("umweroChat")}
                  <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                </Button>
              </Link>
            </div>
            <div>
              <h3 className="font-semibold text-[#8B4513] mb-1 sm:mb-2 text-right text-xs sm:text-sm">
                {t("language")}
              </h3>
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant="ghost"
                  className={`w-full justify-end text-xs sm:text-sm ${language === lang.code ? "bg-[#8B4513] text-[#F3E5AB]" : ""}`}
                  onClick={() => setLanguage(lang.code as "en" | "rw" | "um")}
                >
                  {t(lang.code as TranslationKey)}
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                </Button>
              ))}
            </div>
            <div>
              <h3 className="font-semibold text-[#8B4513] mb-1 sm:mb-2 text-right text-xs sm:text-sm">
                {t("profile")}
              </h3>
              {user ? (
                <div className="text-[#8B4513] text-right text-xs sm:text-sm">
                  <p>
                    {t("welcome")}, {user.username}!
                  </p>
                  <Link href="/profile">
                    <Button variant="link" className="p-0 h-auto font-normal text-[#8B4513] text-xs sm:text-sm">
                      {t("viewProfile")}
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link href="/login" className="w-full">
                  <Button variant="ghost" className="w-full justify-end text-xs sm:text-sm">
                    {t("logIn")}
                    <User className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                  </Button>
                </Link>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-[#8B4513] mb-1 sm:mb-2 text-right text-xs sm:text-sm">{t("cart")}</h3>
              {cart.length > 0 ? (
                <div className="text-[#8B4513] text-right text-xs sm:text-sm">
                  <p>{t("itemsInCart", { count: totalItems })}</p>
                  <p>
                    {t("total")}: ${totalPrice.toFixed(2)}
                  </p>
                  <Link href="/cart" className="w-full">
                    <Button variant="ghost" className="w-full justify-end mt-2 text-xs sm:text-sm relative">
                      {t("viewCart")}
                      <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                      <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1 py-0.5">
                        {totalItems}
                      </span>
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-[#8B4513] text-right text-xs sm:text-sm">{t("cartEmpty")}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

