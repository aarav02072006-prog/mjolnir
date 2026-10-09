'use client'

import { useCartStore, useNetworkStore } from '@/store/store'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Minus, AlertTriangle, ShieldCheck, Clock, ShoppingCart, User } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const { liteMode } = useNetworkStore()
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => setMounted(true), [])

  // Timer logic for flash checkout
  useEffect(() => {
    if (!expiresAt) return
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining === 0) {
        clearInterval(interval)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const handleCheckout = async () => {
    if (!user) {
      setError('Please login to continue checkout.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      if (!navigator.onLine) {
         setError('You are offline. Cart saved locally. Checkout when connection is restored.')
         setLoading(false)
         return
      }

      const res = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
        })
      })
      
      const result = await res.json()
      
      if (res.ok && result.success) {
        setSuccess('Checkout successful! Inventory reserved.')
        setExpiresAt(new Date(result.reservationExpiresAt))
        clearCart()
      } else {
        setError(result.error || 'Failed to checkout. Items may be out of stock.')
      }
    } catch (err) {
      setError('A network error occurred. Please try again.')
    }
    setLoading(false)
  }

  if (!mounted) return null

  if (items.length === 0 && !success) {
    return (
      <div className="container mx-auto px-4 pt-36 pb-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-secondary rounded-full p-6 mb-6 border border-border">
          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/">
          <Button className="bg-foreground text-background hover:opacity-80 px-8 py-6 rounded-full text-lg">Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pt-36 pb-12 min-h-screen text-foreground">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {!user && !success && (
        <div className="bg-card border border-border text-card-foreground p-4 rounded-xl mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-3 text-muted-foreground" />
            <span>Please login to complete your checkout.</span>
          </div>
          <Link href="/auth/login" className="bg-foreground text-background px-4 py-2 rounded-full text-sm font-medium hover:opacity-80 transition-opacity">
            Login
          </Link>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-600/20 text-green-800 dark:text-green-400 p-6 rounded-xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <ShieldCheck className="h-6 w-6 mr-3" />
            <div>
              <p className="font-medium text-lg">{success}</p>
              <p className="text-green-800/80 dark:text-green-400/80 text-sm mt-1">Order has been placed successfully.</p>
            </div>
          </div>
          {expiresAt && timeLeft > 0 && (
             <div className="flex items-center bg-green-500/20 px-4 py-2 rounded-full">
               <Clock className="w-4 h-4 mr-2" />
               <span className="font-mono">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
               <span className="ml-2 text-xs opacity-80">Reserved</span>
             </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
          {error}
        </div>
      )}

      {!success && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.productId} className="flex bg-card text-card-foreground p-4 rounded-2xl shadow-sm border border-border">
                {!liteMode && (
                  <div className="h-24 w-24 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
                    <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                )}
                
                <div className="ml-4 flex-1 flex flex-col">
                  <div>
                    <div className="flex justify-between">
                      <h3 className="text-base font-medium text-card-foreground line-clamp-2">{item.title}</h3>
                      <p className="ml-4 text-base font-medium text-foreground whitespace-nowrap">₹{item.price}</p>
                    </div>
                  </div>
                  <div className="flex-1 flex items-end justify-between text-sm mt-4">
                    <div className="flex items-center border border-border rounded-full bg-muted/50">
                      <button 
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        aria-label={`Decrease quantity of ${item.title}`}
                        className="p-2 hover:bg-secondary rounded-l-full transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-4 font-medium w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.title}`}
                        className="p-2 hover:bg-secondary rounded-r-full transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="font-medium text-muted-foreground hover:text-red-600 dark:hover:text-red-400 flex items-center transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-sm border border-border h-fit sticky top-24">
            <h2 className="text-lg font-medium text-card-foreground mb-6">Order Summary</h2>
            <div className="flow-root">
              <dl className="-my-4 text-sm divide-y divide-border">
                <div className="py-4 flex items-center justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium text-card-foreground">₹{total.toFixed(2)}</dd>
                </div>
                <div className="py-4 flex items-center justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="font-medium text-green-700 dark:text-green-400">Free</dd>
                </div>
                <div className="py-4 flex items-center justify-between font-bold text-lg">
                  <dt className="text-foreground">Order Total</dt>
                  <dd className="text-foreground">₹{total.toFixed(2)}</dd>
                </div>
              </dl>
            </div>
            
            <div className="mt-8">
              <Button 
                onClick={handleCheckout} 
                disabled={loading || !user}
                className="w-full bg-foreground text-background hover:opacity-80 py-6 text-lg rounded-xl disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Secure Checkout'}
              </Button>
              <div className="mt-4 flex items-center justify-center text-xs text-muted-foreground text-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Concurrency-Safe Checkout ensures inventory is locked.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
