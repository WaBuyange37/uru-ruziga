"use client"

import { useState, useEffect } from "react"
import { useCart } from "../contexts/CartContext"
import { useAuth } from "../contexts/AuthContext"
import { useTranslation } from "../../hooks/useTranslation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Minus, Plus, Trash2, ShoppingBag, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice, loading } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    notes: "",
  })
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    await updateQuantity(itemId, newQuantity)
  }

  const handleCheckout = () => {
    setIsCheckingOut(true)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Order submitted", { user, cart, formData, paymentScreenshot })
    alert("Order submitted successfully! We'll contact you soon.")
    setFormData({ phone: "", address: "", notes: "" })
    await clearCart()
    setIsCheckingOut(false)
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center py-16">
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center py-16">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{t("cart")}</h1>
          <p className="text-gray-600 mb-6">{t("cartEmpty")}</p>
          <Button 
            onClick={() => router.push("/gallery")}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">{t("cart")}</h1>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.id} className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">${item.price.toFixed(2)} each</p>
                    
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-gray-300"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-gray-300"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 mb-3">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="border-gray-200 shadow-sm sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg text-sm text-gray-700">
                <p className="font-medium mb-1">Account: {user?.fullName}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button 
                className="w-full bg-amber-600 hover:bg-amber-700 text-white h-11"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Proceed to Checkout
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-gray-300"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {isCheckingOut && (
        <Card className="mt-8 border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Checkout Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="font-semibold text-blue-900 mb-2">Payment Instructions:</p>
              <p className="text-sm text-blue-800 mb-2">
                Send ${totalPrice.toFixed(2)} to MTN Mobile Money: <strong>0786375052</strong>
              </p>
              <div className="bg-white p-3 rounded text-center font-mono text-lg my-2">
                *182*1*1*0786375052#
              </div>
              <p className="text-xs text-blue-700">
                After payment, upload a screenshot below
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                  <Input 
                    id="name" 
                    value={user?.fullName || ''} 
                    disabled 
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <Input 
                    id="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-gray-700">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+250 XXX XXX XXX"
                    required
                    className="border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="text-gray-700">Delivery Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    required
                    className="border-gray-300"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="paymentScreenshot" className="text-gray-700">
                  Payment Screenshot *
                </Label>
                <Input
                  id="paymentScreenshot"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className="border-gray-300"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-gray-700">
                  Order Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions..."
                  rows={3}
                  className="border-gray-300"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white h-11"
                >
                  Submit Order
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setIsCheckingOut(false)}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
