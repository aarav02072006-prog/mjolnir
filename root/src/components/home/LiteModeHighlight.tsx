"use client"

import { motion } from "framer-motion"
import { useNetworkStore } from "@/store/store"
import { Smartphone, Zap, ShieldCheck, Database } from "lucide-react"

export function LiteModeHighlight() {
  const { liteMode, setLiteMode } = useNetworkStore()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  return (
    <section className="py-24 md:py-32 bg-[#050505] relative overflow-hidden border-t border-white/5">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#ec008c]/10 to-transparent pointer-events-none" />
      <div className="absolute -left-64 -top-64 w-[500px] h-[500px] bg-[#ec008c]/[0.06] rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Visual Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#2a071b] to-[#111113] rounded-[3rem] transform -rotate-6 scale-95 shadow-2xl" />
              <div className="absolute inset-0 bg-[#111] rounded-[3rem] border border-white/10 shadow-xl overflow-hidden flex flex-col">
                <div className="h-16 border-b border-white/5 flex items-center px-8 bg-white/5 backdrop-blur-sm justify-between">
                  <div className="font-bold tracking-widest uppercase text-sm text-white">Meesho Lite</div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ec008c] animate-pulse" />
                    <span className="text-xs font-mono text-[#ff4aad]">OPTIMIZED</span>
                  </div>
                </div>
                
                <div className="flex-1 p-8 flex flex-col justify-center space-y-6">
                  {/* Mock UI for Lite Mode showing text-only or reduced data */}
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-[#ec008c]/70" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-3/4 bg-white/10 rounded-md" />
                      <div className="h-3 w-1/2 bg-white/5 rounded-md" />
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Database className="w-6 h-6 text-[#ec008c]/70" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-2/3 bg-white/10 rounded-md" />
                      <div className="h-3 w-1/3 bg-white/5 rounded-md" />
                    </div>
                  </div>

                  <div className="flex gap-4 items-center opacity-50">
                    <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-6 h-6 text-[#ec008c]/70" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-4/5 bg-white/10 rounded-md" />
                      <div className="h-3 w-2/5 bg-white/5 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="w-full lg:w-1/2"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ec008c]/10 border border-[#ec008c]/25 text-[#ff4aad] text-sm font-medium mb-6">
              <Smartphone className="w-4 h-4" />
              Bharat Lite Mode
            </motion.div>
            
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Shopping that never stops.
            </motion.h2>
            
            <motion.p variants={itemVariants} className="text-lg text-white/60 mb-8 font-light">
              Experience blazing fast performance even on 2G networks. Bharat Lite Mode automatically 
              strips heavy images and optimizes network payload while ensuring your persistent cart 
              never loses data.
            </motion.p>
            
            <motion.div variants={itemVariants} className="grid sm:grid-cols-2 gap-6 mb-10">
              <div className="flex flex-col gap-2">
                <div className="text-white font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#ff4aad]" /> Reduced Payloads
                </div>
                <p className="text-sm text-white/50 font-light">
                  Product images are deferred, loading only essential text and price data.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-white font-medium flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#ff4aad]" /> Edge Persistence
                </div>
                <p className="text-sm text-white/50 font-light">
                  Your cart is preserved locally, surviving network drops instantly.
                </p>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <button
                onClick={() => setLiteMode(!liteMode)}
                className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-xl flex items-center gap-3 ${
                  liteMode 
                    ? 'bg-[#1a1a1a] text-white border border-[#ec008c]/50 shadow-[#ec008c]/10 hover:bg-[#242424]' 
                    : 'bg-[#ec008c] hover:bg-[#d00078] text-white shadow-[#ec008c]/20'
                }`}
              >
                {liteMode ? 'Deactivate Lite Mode' : 'Try Lite Mode Now'}
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </button>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
