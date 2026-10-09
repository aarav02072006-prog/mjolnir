"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

export interface EditorialProduct {
  id: string;
  category: string;
  title: string;
  imageUrl?: string;
  description?: string;
  originalPrice: number;
  discountedPrice: number;
  rating?: number;
  reviewCount?: number;
}

export function EditorialGallery({ products }: { products: EditorialProduct[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!products || products.length === 0) return null

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
  }

  const currentProduct = products[currentIndex]

  return (
    <section className="py-24 bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Curated For You
          </h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={handlePrev}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNext}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-[#141414] rounded-3xl overflow-hidden border border-white/10 flex flex-col lg:flex-row">
          {/* Image Side */}
          <div className="w-full lg:w-1/2 relative h-[50vh] lg:h-[70vh] bg-[#111]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProduct.id}
                initial={{ opacity: 0, scale: 0.95, filter: "blur(5px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(5px)" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                {currentProduct.imageUrl && (
                  <img 
                    src={currentProduct.imageUrl} 
                    alt={currentProduct.title}
                    className="w-full h-full object-cover opacity-90"
                  />
                )}
                <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.4)] pointer-events-none" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Details Side */}
          <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProduct.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                className="pl-6 border-l-4 border-rose-500"
              >
                <div className="text-rose-400 text-sm font-semibold tracking-wider uppercase mb-4">
                  {currentProduct.category}
                </div>
                
                <h3 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight tracking-tight">
                  {currentProduct.title}
                </h3>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="text-3xl font-light">₹{currentProduct.discountedPrice}</div>
                  {currentProduct.originalPrice > currentProduct.discountedPrice && (
                    <div className="text-xl text-white/40 line-through">₹{currentProduct.originalPrice}</div>
                  )}
                  {currentProduct.rating && (
                    <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-sm ml-auto">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{currentProduct.rating.toFixed(1)}</span>
                      <span className="text-white/50">({currentProduct.reviewCount})</span>
                    </div>
                  )}
                </div>

                <p className="text-white/60 text-lg mb-12 line-clamp-4 font-light">
                  {currentProduct.description || "Discover premium quality and exceptional design. This carefully selected item brings both style and functionality to your everyday life."}
                </p>

                <Link 
                  href={`/product/${currentProduct.id}`}
                  className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors shadow-lg"
                >
                  Explore Product
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
