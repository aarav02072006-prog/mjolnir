'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Search, User, LogOut, Package, X } from 'lucide-react'
import { useCartStore, useNetworkStore } from '@/store/store'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import logo from '../../logo.png'

export function Navbar() {
  const cartItems = useCartStore((state) => state.items)
  const { liteMode, setLiteMode } = useNetworkStore()
  const { user, clearUser } = useAuthStore()
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const [mounted, setMounted] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [pathname])

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [searchOpen])

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      clearUser()
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`)
    setSearchOpen(false)
    setSearchQuery('')
  }

  const isHome = pathname === '/'
  const hasHomeFilters = ['search', 'category', 'sort', 'page'].some((key) => searchParams.get(key))
  const isImmersiveHome = isHome && !hasHomeFilters && !isScrolled && !searchOpen
  const isHomeSelected = isHome && !searchParams.has('sort') && !searchParams.has('category')
  const isShopSelected = isHome && searchParams.get('category') === 'Women Clothing'
  const isSaleSelected = isHome && searchParams.get('sort') === 'price_asc'

  return (
    <nav className={`w-full fixed top-0 left-0 right-0 z-50 transition-colors duration-300 pt-6 pb-4 ${
      isImmersiveHome
        ? 'navbar-immersive bg-transparent border-transparent shadow-none'
        : 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
    }`}>
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-14 items-center justify-between">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" aria-label="Meesho home" className="flex items-center">
              <span className="relative block h-11 w-36 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5 sm:w-40">
                <Image src={logo} alt="Meesho — Shop more, live better" fill sizes="(min-width: 640px) 160px, 144px" priority className="object-cover" />
              </span>
            </Link>
          </div>

          {/* Center Navigation Pill */}
          <div className="hidden md:flex items-center justify-center bg-secondary/50 rounded-full px-1.5 py-1.5 backdrop-blur-md border border-border/50">
            <div className="flex items-center space-x-1 text-sm font-medium text-muted-foreground">
              <Link
                href="/"
                aria-current={isHomeSelected ? 'page' : undefined}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                  isHomeSelected
                    ? 'bg-background text-foreground shadow-sm'
                    : 'hover:text-foreground hover:bg-background/50'
                }`}
              >
                Home
              </Link>
              <Link
                href="/?category=Women+Clothing"
                aria-current={isShopSelected ? 'page' : undefined}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                  isShopSelected
                    ? 'bg-background text-foreground shadow-sm'
                    : 'hover:text-foreground hover:bg-background/50'
                }`}
              >
                Shop
              </Link>
              <Link
                href="/?sort=price_asc"
                aria-current={isSaleSelected ? 'page' : undefined}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                  isSaleSelected
                    ? 'bg-background text-foreground shadow-sm'
                    : 'hover:text-foreground hover:bg-background/50'
                }`}
              >
                Sale
              </Link>
              {mounted && user && (
                <Link href="/orders" className="px-4 py-1.5 rounded-full transition-all duration-200 hover:text-foreground hover:bg-background/50 flex items-center gap-1">
                  <Package className="w-4 h-4" /> Orders
                </Link>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 text-sm font-medium">
            {mounted && (
              <button
                onClick={() => setLiteMode(!liteMode)}
                title="Bharat Lite Mode - Optimize for slow networks"
                className={`hidden md:flex items-center justify-center px-4 py-2 rounded-full transition-all duration-200 ${
                  liteMode
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent'
                }`}
              >
                {liteMode ? (
                  <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m2 2 20 20"/><path d="m8.5 16.5 7-7"/><path d="M2 8.82a15 15 0 0 1 4.17-2.65"/><path d="M10.66 5c4.01-.36 8.14.9 11.34 3.82"/><path d="M16.85 11.25a10 10 0 0 1 2.22 1.68"/><path d="M5 13a10 10 0 0 1 5.24-2.76"/></svg> Lite: ON</>
                ) : (
                  <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/></svg> Lite Mode</>
                )}
              </button>
            )}

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className="text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 flex items-center justify-center h-10 w-10 rounded-full bg-secondary/50"
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                )}
              </button>
            )}

            {/* Search button — opens inline search bar */}
            <button
              onClick={() => setSearchOpen(v => !v)}
              aria-label="Search products"
              className="text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 flex items-center justify-center h-10 w-10 rounded-full bg-secondary/50"
            >
              {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </button>

            <Link href="/cart" className="relative text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 flex items-center justify-center h-10 w-10 rounded-full bg-secondary/50">
              <ShoppingCart className="h-4 w-4" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="hidden sm:flex items-center space-x-3 ml-2 pl-4">
              {mounted ? (
                user ? (
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" /> {user.name}
                    </span>
                    <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 flex items-center gap-1">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Link href="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2">Login</Link>
                    <Link href="/auth/register" className="bg-foreground text-background hover:opacity-80 transition-opacity px-5 py-2 rounded-full">Sign up</Link>
                  </>
                )
              ) : (
                <div className="w-32 h-10 bg-card animate-pulse rounded-full" />
              )}
            </div>
          </div>
        </div>

        {/* Inline Search Bar — slides in below the navbar row */}
        {searchOpen && (
          <form
            onSubmit={handleSearch}
            className="mt-3 flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products, brands, categories…"
              className="flex-1 bg-transparent text-foreground text-sm placeholder:text-muted-foreground outline-none"
            />
            <button
              type="submit"
              className="text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 px-3 py-1 rounded-full transition-colors"
            >
              Search
            </button>
          </form>
        )}
      </div>
    </nav>
  )
}
