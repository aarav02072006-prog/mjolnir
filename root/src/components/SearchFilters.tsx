'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useCallback, useTransition } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'

const CATEGORIES = [
  'Accessories', 'Automotive', 'Books', 'Clothing',
  'Electronics', 'Fitness', 'Footwear', 'Games', 'Health', 'Kitchen',
]

const SORT_OPTIONS = [
  { value: 'rating_desc', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
]

const inputClass =
  'bg-card border border-border text-foreground text-sm rounded-full px-4 py-2 focus:outline-none focus:border-ring transition-colors placeholder:text-muted-foreground'
const selectClass =
  'bg-card border border-border text-foreground text-sm rounded-full px-4 py-2 focus:outline-none focus:border-ring transition-colors cursor-pointer appearance-none'

export function SearchFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'rating_desc')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')

  const applyFilters = useCallback(
    (overrides: Record<string, string> = {}) => {
      const params = new URLSearchParams()
      const s = overrides.search ?? search
      const c = overrides.category ?? category
      const so = overrides.sort ?? sort
      const mn = overrides.minPrice ?? minPrice
      const mx = overrides.maxPrice ?? maxPrice

      if (s) params.set('search', s)
      if (c) params.set('category', c)
      if (so && so !== 'rating_desc') params.set('sort', so)
      if (mn) params.set('minPrice', mn)
      if (mx) params.set('maxPrice', mx)
      params.set('page', '1')

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [search, category, sort, minPrice, maxPrice, pathname, router]
  )

  const handleReset = () => {
    setSearch('')
    setCategory('')
    setSort('rating_desc')
    setMinPrice('')
    setMaxPrice('')
    startTransition(() => router.push(pathname))
  }

  const hasFilters = search || category || (sort && sort !== 'rating_desc') || minPrice || maxPrice

  return (
    <div className="mb-10">
      {/* Search bar */}
      <div className="relative max-w-2xl mx-auto mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          placeholder="Search products, brands, categories..."
          className="w-full bg-card border border-border text-foreground rounded-full pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:border-ring transition-colors placeholder:text-muted-foreground"
        />
        {search && (
          <button
            onClick={() => { setSearch(''); applyFilters({ search: '' }) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-center justify-center">
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); applyFilters({ category: e.target.value }) }}
          className={selectClass}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); applyFilters({ sort: e.target.value }) }}
          className={selectClass}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={() => applyFilters()}
            placeholder="Min ₹"
            className={`${inputClass} w-24`}
            min="0"
          />
          <span className="text-gray-600">–</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={() => applyFilters()}
            placeholder="Max ₹"
            className={`${inputClass} w-24`}
            min="0"
          />
        </div>

        <button
          onClick={() => applyFilters()}
          disabled={isPending}
          className="bg-foreground text-background text-sm font-medium px-5 py-2 rounded-full hover:opacity-90 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Searching...' : 'Search'}
        </button>

        {hasFilters && (
          <button
            onClick={handleReset}
            className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1 transition-colors"
          >
            <X className="h-3 w-3" /> Reset
          </button>
        )}
      </div>
    </div>
  )
}
