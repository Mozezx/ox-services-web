import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

export interface CartItem {
  tool_id: string
  quantity: number
  name?: string
}

const CART_STORAGE = 'technician_cart'

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CART_STORAGE)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_STORAGE, JSON.stringify(items))
}

type CartContextType = {
  items: CartItem[]
  addItem: (toolId: string, quantity: number, name?: string) => void
  removeItem: (toolId: string) => void
  updateQuantity: (toolId: string, quantity: number) => void
  clearCart: () => void
  cartCount: number
}

const CartContext = createContext<CartContextType | null>(null)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)

  useEffect(() => {
    saveCart(items)
  }, [items])

  const addItem = useCallback((toolId: string, quantity: number, name?: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.tool_id === toolId)
      if (existing) {
        return prev.map((i) =>
          i.tool_id === toolId ? { ...i, quantity: i.quantity + quantity } : i
        )
      }
      return [...prev, { tool_id: toolId, quantity, name }]
    })
  }, [])

  const removeItem = useCallback((toolId: string) => {
    setItems((prev) => prev.filter((i) => i.tool_id !== toolId))
  }, [])

  const updateQuantity = useCallback((toolId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.tool_id !== toolId))
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.tool_id === toolId ? { ...i, quantity } : i))
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, cartCount }}
    >
      {children}
    </CartContext.Provider>
  )
}
