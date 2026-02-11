"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext"
import { showToast } from "@/components/ui/toast"

interface CartItem {
  id: string
  productId: string
  title: string
  price: number
  quantity: number
  imageUrl?: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  totalItems: number
  totalPrice: number
  loading: boolean
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  const refreshCart = async () => {
    if (!isAuthenticated || !user) {
      setCart([])
      return
    }

    const token = getToken()
    if (!token) return

    try {
      setLoading(true)
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCart(data.cart.items || [])
      } else {
        setCart([])
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      setCart([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshCart()
  }, [isAuthenticated, user])

  const addToCart = async (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => {
    if (!isAuthenticated) {
      showToast('Please login to add items to cart', 'error')
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }, 2000)
      return
    }

    const token = getToken()
    if (!token) {
      showToast('Session expired. Please login again.', 'error')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity || 1,
          imageUrl: item.imageUrl
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to cart')
      }

      showToast('Added to cart successfully!', 'success')
      await refreshCart()
    } catch (error) {
      console.error('Add to cart error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart'
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (itemId: string) => {
    if (!isAuthenticated) return

    const token = getToken()
    if (!token) return

    try {
      const response = await fetch('/api/cart/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId })
      })

      if (response.ok) {
        await refreshCart()
      }
    } catch (error) {
      console.error('Remove from cart error:', error)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!isAuthenticated || quantity < 1) return

    const token = getToken()
    if (!token) return

    try {
      const response = await fetch('/api/cart/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId, quantity })
      })

      if (response.ok) {
        await refreshCart()
      }
    } catch (error) {
      console.error('Update quantity error:', error)
    }
  }

  const clearCart = async () => {
    if (!isAuthenticated) return

    const token = getToken()
    if (!token) return

    try {
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setCart([])
      }
    } catch (error) {
      console.error('Clear cart error:', error)
    }
  }

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        totalItems, 
        totalPrice,
        loading,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
