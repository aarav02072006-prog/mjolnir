'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, ShieldAlert, Heart, ShoppingCart, ShoppingBag } from 'lucide-react'
import { useCartStore, useNetworkStore } from '@/store/store'
import { Button } from '@/components/ui/button'

type Product = {
  id: string
  productId: string
  title: string
  brand: string
  originalPrice: number
  discountedPrice: number
  discountPercentage: number
  rating: number
  reviewCount: number
  imageUrl: string
  availability: string
}

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore(state => state.addItem)
  const liteMode = useNetworkStore(state => state.liteMode)
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => setIsMounted(true), [])

  return (
    <div className="group relative flex flex-col bg-transparent transition-all duration-300">
      
      {/* Image Container - Arched / Tombstone shape */}
      <Link href={`/product/${product.id}`} className="flex h-72 md:h-80 items-center justify-center bg-card border border-border overflow-hidden relative rounded-t-[100px] rounded-b-xl mx-2 shadow-lg">
        {isMounted && liteMode ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground">
             <ShieldAlert className="mb-2 h-10 w-10 text-muted-foreground" />
             <span className="text-xs font-semibold tracking-wider uppercase">Lite Mode</span>
           </div>
        ) : product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
            <ShoppingBag className="h-12 w-12" />
          </div>
        )}
        
        {/* Badges & Actions Overlay */}
        <div className="absolute top-4 w-full px-4 flex justify-between items-start z-10">
          {product.discountPercentage > 0 ? (
            <div className="bg-background/40 backdrop-blur-md border border-border text-foreground text-xs font-medium px-3 py-1 rounded-full shadow-sm">
              {product.discountPercentage}% OFF
            </div>
          ) : <div></div>}
          
          <button className="bg-background/50 backdrop-blur-md p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/80 shadow-sm transition-all opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0 border border-border">
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </Link>
      
      {/* Content */}
      <div className="flex flex-1 flex-col p-4 text-center mt-2">
        <div className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-widest">{product.brand || 'Meesho Select'}</div>
        <h3 className="text-sm font-semibold text-foreground line-clamp-1">
          <Link href={`/product/${product.id}`}>
            <span aria-hidden="true" className="absolute inset-0 z-10" />
            {product.title}
          </Link>
        </h3>
        
        <div className="mt-2 flex items-center justify-center space-x-3">
          <span className="text-lg font-light text-foreground">₹{product.discountedPrice}</span>
          {product.originalPrice > product.discountedPrice && (
            <span className="text-xs font-light text-muted-foreground line-through">₹{product.originalPrice}</span>
          )}
        </div>

        {/* Add to Cart - Appears on Hover */}
        <div className="mt-4 z-20 relative transition-all opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0">
           <button
             onClick={(e) => {
               e.preventDefault();
               addItem({
                 productId: product.id,
                 title: product.title,
                 price: product.discountedPrice,
                 imageUrl: product.imageUrl,
                 quantity: 1
               })
             }}
             className={`w-full py-2.5 rounded-full text-sm font-medium transition-all flex items-center justify-center ${product.availability === 'Out of Stock' ? 'bg-muted text-muted-foreground' : 'bg-foreground text-background hover:opacity-90'}`}
             disabled={product.availability === 'Out of Stock'}
           >
             {product.availability === 'Out of Stock' ? (
               'Out of Stock'
             ) : (
               <>
                 <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
               </>
             )}
           </button>
        </div>
      </div>
    </div>
  )
}
