"use client"

import React, { useState } from 'react'
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { useCart } from '../app/contexts/CartContext'
import { Button } from "./ui/button"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"

const initialOptions = {
  clientId: "test", // Replace with your PayPal client ID
  currency: "USD",
  intent: "capture",
};

export const CheckoutForm: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { totalPrice, clearCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState('paypal')

  const handleMobileMoneyPayment = () => {
    // Integrate with your mobile money API here
    alert('Mobile Money payment processing...')
    clearCart()
    onComplete()
  }

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Checkout</h2>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="paypal" id="paypal" />
            <Label htmlFor="paypal">PayPal</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mobile-money" id="mobile-money" />
            <Label htmlFor="mobile-money">Mobile Money</Label>
          </div>
        </RadioGroup>
        <h3 className="text-xl font-semibold">Total: ${selectedItemsTotal.toFixed(2)}</h3>

        {paymentMethod === 'paypal' && (
          <PayPalButtons
            style={{ layout: "vertical" }}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: selectedItemsTotal.toFixed(2),
                    },
                  },
                ],
              })
            }}
            onApprove={(data, actions) => {
              return actions.order!.capture().then(() => {
                alert('Payment successful!')
                deselectAllItems()
                onComplete()
              })
            }}
          />
        )}

        {paymentMethod === 'mobile-money' && (
          <Button onClick={handleMobileMoneyPayment}>
            Pay with Mobile Money
          </Button>
        )}
      </div>
    </PayPalScriptProvider>
  )
}

