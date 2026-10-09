import { Suspense } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/ProductCard'
import { SearchFilters } from '@/components/SearchFilters'
import { ProductGridSkeleton } from '@/components/ProductSkeleton'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { AnimatedHero } from '@/components/home/AnimatedHero'
import { CategoryCards } from '@/components/home/CategoryCards'
import { EditorialGallery } from '@/components/home/EditorialGallery'
import { LiteModeHighlight } from '@/components/home/LiteModeHighlight'
import { PrismaClient } from '@prisma/client'

type SearchParams = {
  search?: string
  category?: string
  sort?: string
  page?: string
  minPrice?: string
  maxPrice?: string
}

async function fetchProducts(params: SearchParams) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const qs = new URLSearchParams()
  if (params.search) qs.set('search', params.search)
  if (params.category) qs.set('category', params.category)
  if (params.sort) qs.set('sort', params.sort)
  if (params.page) qs.set('page', params.page)
  if (params.minPrice) qs.set('minPrice', params.minPrice)
  if (params.maxPrice) qs.set('maxPrice', params.maxPrice)
  qs.set('limit', '20')

  try {
    const res = await fetch(`${baseUrl}/api/products?${qs.toString()}`, {
      cache: 'no-store',
    })
    if (!res.ok) return { products: [], pagination: { page: 1, totalPages: 1, total: 0 } }
    return res.json()
  } catch {
    return { products: [], pagination: { page: 1, totalPages: 1, total: 0 } }
  }
}

async function getFeaturedCategoriesData() {
  const prisma = new PrismaClient()
  const cats = ['Women Clothing', 'Beauty & Health', 'Home & Kitchen', 'Bags & Footwear', 'Accessories']
  const featured = []
  
  for (const c of cats) {
    const p = await prisma.product.findFirst({
      where: { category: c },
      select: { title: true, imageUrl: true, category: true, description: true }
    })
    if (p) {
      featured.push(p)
    }
  }
  return featured
}

async function getEditorialProducts() {
  const prisma = new PrismaClient()
  return await prisma.product.findMany({
    where: { productId: { not: "TEST_PROD_2" } },
    take: 5,
    orderBy: { rating: 'desc' },
    select: {
      id: true,
      title: true,
      category: true,
      imageUrl: true,
      originalPrice: true,
      discountedPrice: true,
      rating: true,
      reviewCount: true,
      description: true
    }
  })
}

async function ProductList({ searchParamsPromise }: { searchParamsPromise: Promise<SearchParams> }) {
  const params = await searchParamsPromise
  const { products, pagination } = await fetchProducts(params)
  const currentPage = parseInt(params.page || '1')

  const buildPageUrl = (page: number) => {
    const p = new URLSearchParams(params as Record<string, string>)
    p.set('page', String(page))
    return `/?${p.toString()}`
  }

  return (
    <>
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-5xl mb-4">{"dY\"?"}</p>
          <h3 className="text-xl font-medium text-gray-300 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-sm mb-6">
            Showing {(currentPage - 1) * 20 + 1}-{Math.min(currentPage * 20, pagination.total)} of {pagination.total} products
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-16">
              {currentPage > 1 ? (
                <Link
                  href={buildPageUrl(currentPage - 1)}
                  className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 text-gray-300 px-5 py-2.5 rounded-full hover:border-white/30 transition-colors text-sm"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Link>
              ) : (
                <div className="px-5 py-2.5 rounded-full opacity-0 pointer-events-none">Previous</div>
              )}

              <span className="text-gray-500 text-sm">
                Page {currentPage} of {pagination.totalPages}
              </span>

              {currentPage < pagination.totalPages ? (
                <Link
                  href={buildPageUrl(currentPage + 1)}
                  className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 text-gray-300 px-5 py-2.5 rounded-full hover:border-white/30 transition-colors text-sm"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <div className="px-5 py-2.5 rounded-full opacity-0 pointer-events-none">Next</div>
              )}
            </div>
          )}
        </>
      )}
    </>
  )
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const isFiltering = (await searchParams).category || (await searchParams).search || (await searchParams).sort || (await searchParams).page;
  const categoriesData = await getFeaturedCategoriesData();
  const editorialProducts = await getEditorialProducts();

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-primary selection:text-primary-foreground">
      
      {!isFiltering && (
        <div className="flex flex-col w-full">
          {/* Section One & Two: Animated multi-category hero & transition to cards */}
          <AnimatedHero categories={categoriesData} />

          {/* Section Three: Scroll-revealed category cards */}
          <CategoryCards categories={categoriesData} />

          {/* Section Four: "Curated For You" editorial gallery */}
          <EditorialGallery products={editorialProducts} />
        </div>
      )}

      {/* Section Five: Trending and featured products */}
      <div className="container mx-auto px-4 pb-20 pt-20">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {isFiltering ? 'Search Results' : 'Popular Right Now'}
          </h2>
          <p className="text-muted-foreground">
            {isFiltering ? 'Find exactly what you are looking for.' : 'Explore our most popular items right now.'}
          </p>
        </div>

        <Suspense fallback={null}>
          <SearchFilters />
        </Suspense>

        <Suspense fallback={<ProductGridSkeleton count={20} />}>
          <ProductList searchParamsPromise={searchParams} />
        </Suspense>
      </div>

      {/* Section Six: Bharat Lite Mode highlight */}
      {!isFiltering && (
        <LiteModeHighlight />
      )}

      {/* Section Five: Final shopping CTA and footer */}
      {!isFiltering && (
        <div className="w-full bg-[#0d0d0d] text-white py-32 border-t border-white/10">
          <div className="container mx-auto px-4 text-center flex flex-col items-center">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight uppercase">Ready to explore?</h2>
            <p className="text-gray-400 text-xl max-w-xl mb-10">
              Discover millions of products at unbeatable prices. Your next favorite item is just a click away.
            </p>
            <Link 
              href="/?sort=price_asc" 
              className="group flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Start Shopping
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
