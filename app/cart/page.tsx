"use client"

import { useState, useEffect } from "react"
import { useCart } from "../contexts/CartContext"
import { useTranslation } from "../../hooks/useTranslation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Minus, Plus, Trash2, Mail, Upload } from "lucide-react"
import Image from "next/image"

export default function CartPage() {
  const { t } = useTranslation()
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    purchaseDescription: "",
  })
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null)

  useEffect(() => {
    // Load form data from localStorage on initial render
    const savedFormData = localStorage.getItem("uruzigaCheckoutFormData")
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData))
    }
  }, [])

  useEffect(() => {
    // Save form data to localStorage whenever it changes
    localStorage.setItem("uruzigaCheckoutFormData", JSON.stringify(formData))
  }, [formData])

  const handleQuantityChange = (id: string, newQuantity: number) => {
    updateQuantity(id, newQuantity)
  }

  const handleCheckout = () => {
    setIsCheckingOut(true)
  }

  const handleContactEmail = () => {
    window.location.href = "mailto:37nzela@gmail.com"
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentScreenshot(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement form submission logic
    console.log("Form submitted", formData, paymentScreenshot)
    // Clear form data and cart after successful submission
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      purchaseDescription: "",
    })
    localStorage.removeItem("uruzigaCheckoutFormData")
    clearCart()
    setIsCheckingOut(false)
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-[#8B4513]">{t("cart")}</h1>
        <p className="text-center text-lg">{t("cartEmpty")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-[#8B4513]">{t("cart")}</h1>
      <div className="grid gap-6">
        {cart.map((item) => (
          <Card key={item.id} className="bg-[#F3E5AB] border-[#8B4513]">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB]"
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, Number.parseInt(e.target.value))}
                  className="w-16 text-center"
                  min="1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB]"
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                <Button
                  variant="destructive"
                  size="icon"
                  className="border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB]"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-[#F3E5AB] border-[#8B4513] mt-8">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>{t("total")}</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" className="border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB]" onClick={clearCart}>
            {t("clearCart")}
          </Button>
          <Button className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]" onClick={handleCheckout}>
            {t("proceedToCheckout")}
          </Button>
        </CardFooter>
      </Card>

      {isCheckingOut && (
        <Card className="bg-[#F3E5AB] border-[#8B4513] mt-8">
          <CardHeader>
            <CardTitle>{t("checkoutInstructions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="mb-2 font-semibold text-[#D2691E]">{t("ussdInstructions")}</p>
              <div className="bg-gray-100 p-4 rounded-md text-center mb-4">
                <span className="text-xl font-bold">*182*1*1*0786375052#</span>
              </div>
              <Image
                src="/ussd-screenshot.png"
                alt="USSD Screenshot"
                width={300}
                height={600}
                className="mx-auto mb-4"
              />
            </div>
            <p className="mb-4 text-[#D2691E]">{t("useMtnMobileMoney")} 0786375052 Umwero</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-[#8B4513]">
                  {t("name")}
                </Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="email" className="text-[#8B4513]">
                  {t("email")}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-[#8B4513]">
                  {t("phone")}
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="address" className="text-[#8B4513]">
                  {t("address")}
                </Label>
                <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="paymentScreenshot" className="text-[#8B4513]">
                  {t("uploadPaymentScreenshot")}
                </Label>
                <Input id="paymentScreenshot" type="file" accept="image/*" onChange={handleFileChange} required />
              </div>
              <div>
                <Label htmlFor="purchaseDescription" className="text-[#8B4513]">
                  {t("briefPurchaseDescription")}
                </Label>
                <Textarea
                  id="purchaseDescription"
                  name="purchaseDescription"
                  value={formData.purchaseDescription}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button type="submit" className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D] w-full">
                {t("submitOrder")}
              </Button>
            </form>
            <div className="mt-4">
              <p className="text-[#D2691E]">{t("emailInstructions")}</p>
              <Button
                onClick={handleContactEmail}
                className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D] w-full mt-2"
              >
                <Mail className="mr-2 h-4 w-4" />
                {t("contactEmail")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

