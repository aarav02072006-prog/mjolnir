import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subDays } from 'date-fns'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Parse period parameter
    const searchParams = req.nextUrl.searchParams
    const period = searchParams.get('period') || '30d' // default to 30d
    
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, discountedPrice: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Determine the cutoff date based on the period
    let cutoffDate: Date | undefined
    if (period === '7d') cutoffDate = subDays(new Date(), 7)
    else if (period === '30d') cutoffDate = subDays(new Date(), 30)
    else if (period === '90d') cutoffDate = subDays(new Date(), 90)
    // 'all' doesn't use a cutoff date

    // Retrieve history records
    const history = cutoffDate
      ? await prisma.$queryRaw<Array<{ price: number; recordedAt: Date; isSimulated: boolean }>>`
          SELECT price, recordedAt, isSimulated
          FROM PriceHistory
          WHERE productId = ${id} AND recordedAt >= ${cutoffDate}
          ORDER BY recordedAt ASC
        `
      : await prisma.$queryRaw<Array<{ price: number; recordedAt: Date; isSimulated: boolean }>>`
          SELECT price, recordedAt, isSimulated
          FROM PriceHistory
          WHERE productId = ${id}
          ORDER BY recordedAt ASC
        `

    return NextResponse.json({
      productId: product.id,
      currency: 'INR',
      period,
      currentPrice: product.discountedPrice,
      history
    })
  } catch (err) {
    console.error('[GET /api/products/[id]/price-history]', err)
    return NextResponse.json({ error: 'Failed to fetch price history' }, { status: 500 })
  }
}
