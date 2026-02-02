import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../components/Toast'

const Cart = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t } = useLanguage()
  const { items, removeItem, updateQuantity, clearCart, cartCount } = useCart()
  const { addToast } = useToast()
  const [notes, setNotes] = useState('')

  const submitMutation = useMutation({
    mutationFn: () =>
      api.createToolOrder(
        items.map((i) => ({ tool_id: i.tool_id, quantity: i.quantity })),
        notes.trim() || undefined
      ),
    onSuccess: () => {
      clearCart()
      queryClient.invalidateQueries({ queryKey: ['technician-orders'] })
      addToast('success', 'Tool request sent!')
      navigate('/orders')
    },
    onError: (err: Error) => {
      addToast('error', err.message || t.common.error)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      addToast('error', t.cart.empty)
      return
    }
    submitMutation.mutate()
  }

  if (cartCount === 0 && items.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-white">{t.cart.title}</h1>
        <div className="card text-center py-12">
          <span className="material-symbols-outlined text-4xl text-text-light mb-4 block">shopping_cart</span>
          <p className="text-text-light">{t.cart.empty}</p>
          <button type="button" onClick={() => navigate('/shop')} className="btn btn-primary mt-4 text-white">
            Go to shop
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-bold text-white">{t.cart.title}</h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.tool_id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name || item.tool_id}</p>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.tool_id, parseInt(e.target.value, 10) || 1)}
                    className="input w-20 py-1 text-center"
                  />
                  <span className="text-sm text-text-light">{t.cart.quantity}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.tool_id)}
                className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                title="Remove"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </li>
          ))}
        </ul>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input w-full min-h-[80px]"
            rows={3}
            placeholder="Any notes for the admin..."
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="btn btn-outline"
          >
            {t.common.back}
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1 text-white"
            disabled={submitMutation.isPending || items.length === 0}
          >
            {submitMutation.isPending ? (
              <>
                <span className="material-symbols-outlined animate-spin text-white">progress_activity</span>
                <span className="text-white">{t.common.loading}</span>
              </>
            ) : (
              <span className="text-white">{t.cart.requestTools}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Cart
