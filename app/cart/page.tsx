"use client"

import { useState } from 'react'
import { useCart } from '../contexts/CartContext'
import { useTranslation } from '../../hooks/useTranslation'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Checkbox } from "../../components/ui/checkbox"
import { Minus, Plus, Trash2 } from 'lucide-react'
import { CheckoutForm } from '../../components/CheckoutForm'

export default function CartPage() {
  const { t } = useTranslation()
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    toggleItemSelection, 
    selectAllItems, 
    deselectAllItems,
    selectedItemsTotal,
    totalPrice 
  } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [purchaseComplete, setPurchaseComplete] = useState(false)

  const handleQuantityChange = (id: string, newQuantity: number) => {
    updateQuantity(id, newQuantity)
  }

  const handleCheckout = () => {
    setIsCheckingOut(true)
  }

  const handlePurchaseComplete = () => {
    setPurchaseComplete(true)
    setIsCheckingOut(false)
  }

  if (purchaseComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-[#8B4513]">{t('purchaseComplete')}</h1>
        <p className="text-center text-lg">{t('thankYouForYourPurchase')}</p>
        <Button className="mt-4 mx-auto block" onClick={() => setPurchaseComplete(false)}>
          {t('continueShopping')}
        </Button>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-[#8B4513]">{t('cart')}</h1>
        <p className="text-center text-lg">{t('cartEmpty')}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-[#8B4513]">{t('cart')}</h1>
      {isCheckingOut ? (
        <CheckoutForm onComplete={handlePurchaseComplete} />
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <Button onClick={selectAllItems}>{t('selectAll')}</Button>
            <Button onClick={deselectAllItems}>{t('deselectAll')}</Button>
          </div>
          <div className="grid gap-6">
            {cart.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center">
                    <Checkbox
                      checked={item.selected}
                      onCheckedChange={() => toggleItemSelection(item.id)}
                      className="mr-2"
                    />
                    <CardTitle>{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                      className="w-16 text-center"
                      min="1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>{t('selectedTotal')}</span>
                <span>${selectedItemsTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold mt-2">
                <span>{t('total')}</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={clearCart}>
                {t('clearCart')}
              </Button>
              <Button onClick={handleCheckout}>{t('proceedToCheckout')}</Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  )
}

