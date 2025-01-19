"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type CartItem = {
  id: string
  title: string
  price: number
  quantity: number
  selected: boolean
}

type CartContextType = {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity' | 'selected'>) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleItemSelection: (id: string) => void
  selectAllItems: () => void
  deselectAllItems: () => void
  selectedItemsTotal: number
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (item: Omit<CartItem, 'quantity' | 'selected'>) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }
      return [...prevCart, { ...item, quantity: 1, selected: true }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter(item => item.quantity > 0)
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const toggleItemSelection = (id: string) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    )
  }

  const selectAllItems = () => {
    setCart(prevCart => prevCart.map(item => ({ ...item, selected: true })))
  }

  const deselectAllItems = () => {
    setCart(prevCart => prevCart.map(item => ({ ...item, selected: false })))
  }

  const selectedItemsTotal = cart.reduce((total, item) => 
    item.selected ? total + item.price * item.quantity : total, 0
  )

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleItemSelection,
      selectAllItems,
      deselectAllItems,
      selectedItemsTotal,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

