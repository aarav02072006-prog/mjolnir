'use client'

import { useCartStore } from '@/store/store'
import { ShoppingCart, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export function AddToCartButton({ product }: { product: any }) {
  const addItem = useCartStore(state => state.addItem)
  const [added, setAdded] = useState(false)
  const outOfStock = product.availability === 'Out of Stock'

  const handleAdd = () => {
    if (outOfStock) return
    addItem({
      productId: product.id,
      title: product.title,
      price: product.discountedPrice,
      imageUrl: product.imageUrl,
      quantity: 1
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button
      onClick={handleAdd}
      disabled={outOfStock}
      className={`w-full flex items-center justify-center gap-2 py-4 px-8 rounded-xl text-base font-semibold transition-all duration-200
        ${outOfStock
          ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
          : added
          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
          : 'bg-pink-600 hover:bg-pink-500 active:bg-pink-700 text-white shadow-lg shadow-pink-900/20'
        }`}
    >
      {added ? (
        <><CheckCircle className="h-5 w-5" /> Added to Cart</>
      ) : (
        <><ShoppingCart className="h-5 w-5" /> {outOfStock ? 'Out of Stock' : 'Add to Cart'}</>
      )}
    </button>
  )
}
