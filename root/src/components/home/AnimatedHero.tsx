"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface HeroProps {
  categories: {
    title: string
    imageUrl: string
    category: string
    description: string
  }[]
}

export function AnimatedHero({ categories }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isHovered, setIsHovered] = useState(false)

  const heroRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])

  useEffect(() => {
    if (!categories.length || isHovered) return

    const interval = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % categories.length)
    }, 5500)

    return () => clearInterval(interval)
  }, [categories.length, isHovered])

  if (!categories || categories.length === 0) return null

  const current = categories[currentIndex]

  const next = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % categories.length)
  }

  const previous = () => {
    setDirection(-1)
    setCurrentIndex(
      (prev) => (prev - 1 + categories.length) % categories.length
    )
  }

  return (
    <motion.section
      ref={heroRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative min-h-[92vh] overflow-hidden bg-[#07070a] text-white"
      style={{ opacity: heroOpacity }}
    >

      {/* ================================================= */}
      {/* COLORFUL BACKGROUND */}
      {/* ================================================= */}

      <motion.div
        style={{ scale: bgScale }}
        className="absolute inset-0 pointer-events-none"
      >

        {/* Purple */}
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -50, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            -left-32
            top-10
            h-[500px]
            w-[500px]
            rounded-full
            bg-purple-600/30
            blur-[130px]
          "
        />

        {/* Pink */}
        <motion.div
          animate={{
            x: [0, -70, 0],
            y: [0, 80, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            -right-32
            top-20
            h-[480px]
            w-[480px]
            rounded-full
            bg-pink-500/25
            blur-[130px]
          "
        />

        {/* Blue */}
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -70, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            left-1/2
            bottom-[-250px]
            h-[550px]
            w-[550px]
            -translate-x-1/2
            rounded-full
            bg-blue-500/25
            blur-[140px]
          "
        />

        {/* Center glow */}
        <div
          className="
            absolute
            left-1/2
            top-1/2
            h-[500px]
            w-[500px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-white/[0.035]
            blur-[100px]
          "
        />

      </motion.div>


      {/* ================================================= */}
      {/* SUBTLE GRID */}
      {/* ================================================= */}

      <div
        className="
          absolute
          inset-0
          pointer-events-none
          opacity-[0.035]
          bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)]
          bg-[size:80px_80px]
        "
      />


      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <motion.div
        style={{ y: heroY }}
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-[92vh]
          max-w-7xl
          items-center
          px-6
          py-20
        "
      >

        <div className="grid w-full grid-cols-1 items-center gap-10 md:grid-cols-2">


          {/* ================================================= */}
          {/* LEFT SIDE — CATEGORY */}
          {/* ================================================= */}

          <div className="relative z-20 text-center md:text-left">

            <p className="
              mb-5
              text-xs
              font-medium
              tracking-[0.45em]
              text-white/45
            ">
              TRENDING NOW
            </p>

            <div className="overflow-hidden">

              <AnimatePresence
                mode="wait"
                initial={false}
                custom={direction}
              >

                <motion.div
                  key={current.category}
                  custom={direction}
                  initial={{
                    opacity: 0,
                    x: direction > 0 ? -180 : 180,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: direction > 0 ? 180 : -180,
                  }}
                  transition={{
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >

                  <h1 className="
                    text-[15vw]
                    leading-[0.78]
                    font-black
                    uppercase
                    tracking-[-0.07em]
                    text-white
                    md:text-[8vw]
                    lg:text-[7.5rem]
                  ">
                    {current.category}
                  </h1>

                  <h2 className="
                    mt-7
                    text-3xl
                    font-light
                    tracking-tight
                    text-white/80
                    md:text-4xl
                  ">
                    {current.title}
                  </h2>

                  <p className="
                    mx-auto
                    mt-4
                    max-w-md
                    text-sm
                    leading-6
                    text-white/45
                    md:mx-0
                    md:text-base
                  ">
                    {current.description}
                  </p>

                </motion.div>

              </AnimatePresence>

            </div>


            {/* CTA */}

            <AnimatePresence mode="wait">

              <motion.div
                key={current.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="mt-8"
              >

                <Link
                  href={`/?category=${encodeURIComponent(
                    current.category
                  )}`}
                  className="
                    group
                    inline-flex
                    items-center
                    gap-3
                    rounded-full
                    bg-white
                    px-7
                    py-3.5
                    text-sm
                    font-semibold
                    text-black
                    transition-all
                    duration-300
                    hover:scale-105
                  "
                >
                  Explore Collection

                  <span className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    bg-black
                    text-white
                    transition-transform
                    group-hover:translate-x-1
                  ">
                    <ArrowRight className="h-4 w-4" />
                  </span>

                </Link>

              </motion.div>

            </AnimatePresence>


            {/* Slide indicators */}

            <div className="
              mt-10
              flex
              items-center
              justify-center
              gap-2
              md:justify-start
            ">

              {categories.map((cat, index) => (

                <button
                  key={`${cat.category}-${index}`}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1)
                    setCurrentIndex(index)
                  }}
                  className={`
                    h-1.5
                    rounded-full
                    transition-all
                    duration-500
                    ${
                      index === currentIndex
                        ? "w-12 bg-white"
                        : "w-2 bg-white/25 hover:bg-white/50"
                    }
                  `}
                />

              ))}

            </div>

          </div>


          {/* ================================================= */}
          {/* RIGHT SIDE — REAL PRODUCT */}
          {/* ================================================= */}

          <div className="
            relative
            flex
            h-[520px]
            items-center
            justify-center
            md:h-[650px]
          ">

            {/* Giant glow behind product */}

            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.35, 0.5, 0.35],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute
                h-[300px]
                w-[300px]
                rounded-full
                bg-pink-500/30
                blur-[100px]
                md:h-[450px]
                md:w-[450px]
              "
            />


            {/* Product */}

            <AnimatePresence
              mode="wait"
              custom={direction}
            >

              <motion.div
                key={current.category}
                custom={direction}
                initial={{
                  opacity: 0,
                  x: direction > 0 ? 220 : -220,
                  scale: 0.72,
                  rotate: direction > 0 ? 8 : -8,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  rotate: 0,
                }}
                exit={{
                  opacity: 0,
                  x: direction > 0 ? -220 : 220,
                  scale: 0.72,
                  rotate: direction > 0 ? -8 : 8,
                }}
                transition={{
                  duration: 0.8,
                  type: "spring",
                  stiffness: 80,
                  damping: 16,
                }}
                className="relative z-20"
              >

                {/* Product image */}

                <motion.div
                  animate={{
                    y: [0, -12, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="
                    relative
                    h-[350px]
                    w-[300px]
                    overflow-hidden
                    rounded-[2rem]
                    border
                    border-white/15
                    bg-white/[0.07]
                    shadow-[0_30px_100px_rgba(0,0,0,0.55)]
                    backdrop-blur-sm
                    sm:h-[420px]
                    sm:w-[360px]
                    md:h-[500px]
                    md:w-[420px]
                  "
                >

                  <img
                    src={current.imageUrl}
                    alt={current.title}
                    className="
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-700
                      hover:scale-105
                    "
                  />

                  {/* Image glass overlay */}

                  <div className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/50
                    via-transparent
                    to-white/10
                  " />

                  {/* Category badge */}

                  <div className="
                    absolute
                    bottom-5
                    left-5
                    rounded-full
                    border
                    border-white/20
                    bg-black/40
                    px-5
                    py-2
                    text-xs
                    font-medium
                    tracking-[0.2em]
                    text-white
                    backdrop-blur-xl
                  ">
                    {current.category}
                  </div>

                </motion.div>

              </motion.div>

            </AnimatePresence>


            {/* LEFT ARROW */}

            <button
              onClick={previous}
              className="
                absolute
                left-0
                z-30
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                border
                border-white/15
                bg-white/[0.06]
                text-white/70
                backdrop-blur-xl
                transition-all
                hover:scale-110
                hover:bg-white
                hover:text-black
                md:left-2
              "
            >
              <ChevronLeft className="h-5 w-5" />
            </button>


            {/* RIGHT ARROW */}

            <button
              onClick={next}
              className="
                absolute
                right-0
                z-30
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                border
                border-white/15
                bg-white/[0.06]
                text-white/70
                backdrop-blur-xl
                transition-all
                hover:scale-110
                hover:bg-white
                hover:text-black
                md:right-2
              "
            >
              <ChevronRight className="h-5 w-5" />
            </button>

          </div>

        </div>

      </motion.div>


      {/* ================================================= */}
      {/* BOTTOM SCROLL INDICATOR */}
      {/* ================================================= */}

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
        className="
          absolute
          bottom-7
          left-1/2
          z-30
          -translate-x-1/2
          text-[10px]
          tracking-[0.4em]
          text-white/35
        "
      >
        SCROLL
      </motion.div>

    </motion.section>
  )
}