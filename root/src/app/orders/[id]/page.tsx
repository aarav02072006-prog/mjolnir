'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Clock, XCircle, Package } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useNetworkStore } from '@/store/store'
import { useRouter } from 'next/navigation'

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const orderId = unwrappedParams.id

  const { user } = useAuthStore()
  const liteMode = useNetworkStore((state) => state.liteMode)
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [confirming, setConfirming] = useState(false)

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleRazorpayPayment = async () => {
    if (confirming) return
    setConfirming(true)
    try {
      // 1. Create Razorpay order
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to initialize payment')
        setConfirming(false)
        return
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'Meesho Hackathon',
        description: 'Test Mode Transaction',
        order_id: data.order_id,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              internal_order_id: data.internal_order_id
            })
          })
          const verifyData = await verifyRes.json()
          if (verifyData.success) {
            setOrder({ ...order, status: 'COMPLETED' })
          } else {
            alert('Payment verification failed: ' + verifyData.error)
          }
          setConfirming(false)
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#ec008c'
        },
        modal: {
          ondismiss: function() {
            setConfirming(false)
          }
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        alert('Payment Failed: ' + response.error.description)
        setConfirming(false)
      })
      rzp.open()
    } catch (err) {
      alert('Network error')
      setConfirming(false)
    }
  }

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        const data = await res.json()
        if (res.ok) {
          setOrder(data.order)
        } else {
          setError(data.error || 'Failed to load order')
        }
      } catch (err) {
        setError('Network error')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [user, router, orderId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-muted-foreground"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-foreground">
        <h1 className="text-2xl mb-4">Error loading order</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Link href="/orders" className="text-foreground hover:underline">Back to Orders</Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen text-foreground max-w-4xl">
      <Link href="/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
      </Link>
      
      <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Order #{order.id.slice(-8).toUpperCase()}</h1>
            <p className="text-muted-foreground text-sm">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-4">
            {order.status === 'PENDING' && (
              <button
                onClick={handleRazorpayPayment}
                disabled={confirming}
                className="rounded-full bg-[#ec008c] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#d00078] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ec008c] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
              >
                {confirming ? 'Initializing...' : 'Pay securely with Razorpay - Test Mode'}
              </button>
            )}
            <div className="px-4 py-2 bg-secondary rounded-full flex items-center gap-2">
              {order.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4 text-green-700 dark:text-green-400" /> :
               order.status === 'PENDING' ? <Clock className="w-4 h-4 text-amber-700 dark:text-yellow-400" /> :
               <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />}
              <span className={`text-sm font-medium ${
                order.status === 'COMPLETED' ? 'text-green-700 dark:text-green-400' :
                order.status === 'PENDING' ? 'text-amber-700 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {order.status}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-medium">Items Ordered</h2>
          {order.items.map((item: any) => (
            <div key={item.id} className="flex gap-4 p-4 bg-muted/50 rounded-xl border border-border">
              <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                {!liteMode && item.product?.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.title} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-medium line-clamp-1">{item.product?.title || 'Unknown Product'}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.product?.brand}</p>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                  <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-8 pt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="text-green-700 dark:text-green-400">Free</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-foreground border-t border-border pt-3">
              <span>Total</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
