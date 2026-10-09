import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SORT_MAP: Record<string, object> = {
  price_asc: { discountedPrice: 'asc' },
  price_desc: { discountedPrice: 'desc' },
  rating_desc: { rating: 'desc' },
  newest: { productId: 'desc' },
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const search = searchParams.get('search')?.trim().toLowerCase() || ''
    const category = searchParams.get('category')?.trim() || ''
    const sort = searchParams.get('sort') || 'rating_desc'
    const minPrice = parseFloat(searchParams.get('minPrice') || '0') || 0
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '0') || 0

    const orderBy = SORT_MAP[sort] ?? { rating: 'desc' }

    const where: any = {}

    if (search) {
      // SQLite LIKE is case-insensitive for ASCII. We lowercase the input so
      // "Saree", "saree", "SAREE" all generate the same LIKE '%saree%' query.
      // mode: 'insensitive' is silently ignored by Prisma 5 on SQLite so we omit it.
      where.OR = [
        { title: { contains: search } },
        { brand: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
      ]
    }

    if (category) {
      // Exact category match — kept as-is since category values come from
      // the dropdown which uses exact strings from the dataset.
      where.category = { equals: category }
    }

    if (minPrice > 0 || maxPrice > 0) {
      where.discountedPrice = {}
      if (minPrice > 0) where.discountedPrice.gte = minPrice
      if (maxPrice > 0) where.discountedPrice.lte = maxPrice
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          productId: true,
          title: true,
          category: true,
          brand: true,
          originalPrice: true,
          discountedPrice: true,
          discountPercentage: true,
          rating: true,
          reviewCount: true,
          availability: true,
          stockCount: true,
          imageUrl: true,
        },
      }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('[GET /api/products]', err)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
