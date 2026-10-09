'use client'

import { useNetworkStore } from '@/store/store'
import { ShoppingBag, ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ProductImage({ imageUrl, title, className = "w-full aspect-[3/4] object-cover" }: { imageUrl: string, title: string, className?: string }) {
  const { liteMode } = useNetworkStore()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => setMounted(true), [])
  
  if (mounted && liteMode) {
    return (
       <div className={`flex flex-col items-center justify-center bg-muted text-muted-foreground gap-4 ${className.replace('object-cover', '')}`}>
         <ShieldAlert className="h-16 w-16 opacity-50" />
         <span className="text-xs font-semibold tracking-wider uppercase">Lite Mode</span>
       </div>
    )
  }
  
  if (!imageUrl) {
    return (
       <div className={`flex flex-col items-center justify-center bg-muted text-muted-foreground gap-4 ${className.replace('object-cover', '')}`}>
         <ShoppingBag className="h-16 w-16 opacity-50" />
         <span className="text-sm">No image</span>
       </div>
    )
  }
  
  return (
    <img
      src={imageUrl}
      alt={title}
      className={className}
    />
  )
}
