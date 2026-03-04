import React, { useState, useEffect } from 'react'
import CartContext from './CartContext'
import * as cartService from '../services/cartService'
import { useAuth } from './AuthContext'

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user?.id) {
      setCart([])
      setLoading(false)
      return
    }

    async function fetchCart() {
      try {
        setLoading(true)
        const data = await cartService.getCart(user.id)
        setCart(data)
      } catch (error) {
        console.error('Failed to fetch cart:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCart()
  }, [user?.id, authLoading])

  const addItem = async (product, quantity = 1) => {
    if (!user?.id) {
      throw new Error('Utilisateur non authentifié pour le panier')
    }

    try {
      // Optimistic update: add to cart immediately
      const existingItem = cart.find((item) => item.products.id === product.id)
      if (existingItem) {
        const updatedCart = cart.map((item) =>
          item.products.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        )
        setCart(updatedCart)
      } else {
        // This is tricky without the real backend response.
        // We'll just add the product info and a temporary quantity.
        const tempNewItem = {
            id: `temp-${Date.now()}`, // Temporary ID
            quantity: quantity,
            products: product
        }
        setCart([...cart, tempNewItem])
      }
      
      await cartService.addItemToCart({ product_id: product.id, quantity }, user.id)
      // To get the real cart state, we should probably refetch it.
      const data = await cartService.getCart(user.id)
      setCart(data)


    } catch (error) {
      console.error('Failed to add item to cart:', error)
      // Optionally, revert the optimistic update here
    }
  }

  const updateItemQuantity = async (itemId, quantity) => {
    if (!user?.id) {
      throw new Error('Utilisateur non authentifié pour le panier')
    }

    if (quantity <= 0) {
      return removeItem(itemId)
    }
    try {
      const updatedCart = cart.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
      setCart(updatedCart)
      await cartService.updateCartItem(itemId, { quantity }, user.id)
    } catch (error) {
      console.error('Failed to update item quantity:', error)
    }
  }

  const removeItem = async (itemId) => {
    if (!user?.id) {
      throw new Error('Utilisateur non authentifié pour le panier')
    }

    try {
      const updatedCart = cart.filter((item) => item.id !== itemId)
      setCart(updatedCart)
      await cartService.removeCartItem(itemId, user.id)
    } catch (error) {
      console.error('Failed to remove item from cart:', error)
    }
  }

  const clearCart = async () => {
    if (!user?.id) {
      throw new Error('Utilisateur non authentifié pour le panier')
    }

    try {
        setCart([])
        await cartService.clearCart(user.id)
    } catch (error) {
        console.error('Failed to clear cart:', error)
    }
  }

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0)
  const totalPrice = cart.reduce((total, item) => total + (item.products?.price || 0) * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        totalPrice,
        loading,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
