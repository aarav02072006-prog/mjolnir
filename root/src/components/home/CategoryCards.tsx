"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export interface CategoryCardItem {
  category: string;
  imageUrl?: string;
  description?: string;
}

export function CategoryCards({ categories }: { categories: CategoryCardItem[] }) {
  if (!categories || categories.length === 0) return null

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" as any }
    },
  }

  // Accent backgrounds for editorial feel
  const accents = [
    "bg-rose-950/40 border-rose-900/30",
    "bg-amber-950/40 border-amber-900/30",
    "bg-emerald-950/40 border-emerald-900/30",
    "bg-indigo-950/40 border-indigo-900/30",
    "bg-purple-950/40 border-purple-900/30",
  ]

  return (
    <section className="py-24 md:py-32 bg-background relative z-10 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16 md:mb-24 flex flex-col items-start"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-6 uppercase">
            EXPLORE<br />YOUR WORLD
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-xl font-light">
            Dive into our meticulously curated collections. 
            Discover pieces that elevate your everyday style and transform your spaces.
          </p>
        </motion.div>

        {/* Asymmetrical Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 auto-rows-[400px]"
        >
          {categories.map((cat, idx) => {
            // Asymmetrical layout classes
            let spanClasses = ""
            if (idx === 0) spanClasses = "md:col-span-8 row-span-1"
            else if (idx === 1) spanClasses = "md:col-span-4 row-span-1"
            else if (idx === 2) spanClasses = "md:col-span-4 row-span-1 md:mt-12"
            else if (idx === 3) spanClasses = "md:col-span-8 row-span-1"
            else spanClasses = "md:col-span-6 row-span-1"

            const accent = accents[idx % accents.length]

            return (
              <motion.div 
                key={idx} 
                variants={cardVariants}
                className={`group relative rounded-3xl overflow-hidden border flex flex-col justify-end ${spanClasses} ${accent}`}
              >
                {/* Background Image */}
                <div className="absolute inset-0 bg-[#111]">
                  {cat.imageUrl && (
                    <img 
                      src={cat.imageUrl} 
                      alt={cat.category}
                      className="w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-110"
                    />
                  )}
                  {/* Gradient Overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 transition-opacity duration-700 group-hover:opacity-70" />
                </div>
                
                {/* Content */}
                <div className="relative z-10 p-6 md:p-10 flex flex-col h-full justify-between pointer-events-none">
                  <div className="text-white/40 text-3xl md:text-4xl font-light font-mono tracking-widest">
                    0{idx + 1}
                  </div>
                  
                  <div className="pointer-events-auto">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">{cat.category}</h3>
                    <p className="text-white/70 mb-6 max-w-sm line-clamp-2 font-light">
                      {cat.description || `Explore the latest arrivals and trending essentials in ${cat.category.toLowerCase()}.`}
                    </p>
                    <Link 
                      href={`/?category=${encodeURIComponent(cat.category)}`}
                      className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors group/btn w-fit shadow-xl"
                    >
                      Explore
                      <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
