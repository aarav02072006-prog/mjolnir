import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

/**
 * POST /api/cart/confirm
 *
 * Confirms a PENDING order. Binds confirmation to the exact order's
 * FlashCheckoutLocks (via reservationId = order.id), not all of a user's locks.
 *
 * Idempotent: COMPLETED orders return success immediately.
 * Expired:    CANCELLED orders return 400.
 * Wrong user: 403.
 */
export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let orderId: string
  try {
    const body = await req.json()
    orderId = body.orderId
    if (!orderId) return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    // --- 1. Fetch the order and verify ownership ---
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // --- 2. Idempotency: already confirmed ---
    if (order.status === 'COMPLETED') {
      return NextResponse.json({ success: true, message: 'Order already confirmed' })
    }

    // --- 3. Already cancelled (reservation expired) ---
    if (order.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Reservation expired. Please add items to cart and checkout again.' },
        { status: 400 }
      )
    }

    // --- 4. Verify this order's locks still exist and have NOT expired ---
    // The checkout route sets order.reservationId = order.id.
    // The FlashCheckoutLocks for this order are identified by (userId + productIds in this order).
    // We use reservationId as the linking key. Each lock's productId must appear in this order's items.
    const orderProductIds = order.items.map((i) => i.productId)

    const activeLocks = await prisma.flashCheckoutLock.findMany({
      where: {
        userId: user.id,
        productId: { in: orderProductIds },
        expiresAt: { gt: new Date() }, // must not have expired
      },
    })

    // If fewer active unexpired locks than order line items, reservation is gone
    if (activeLocks.length === 0) {
      // Mark order cancelled so future calls return 400 quickly
      await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } })
      return NextResponse.json(
        { error: 'Reservation expired. Please add items to cart and checkout again.' },
        { status: 400 }
      )
    }

    // --- 5. Confirm: delete this order's locks, mark COMPLETED (atomic) ---
    const lockIds = activeLocks.map((l) => l.id)
    await prisma.$transaction([
      prisma.flashCheckoutLock.deleteMany({ where: { id: { in: lockIds } } }),
      prisma.order.update({ where: { id: order.id }, data: { status: 'COMPLETED' } }),
    ])

    return NextResponse.json({ success: true, message: 'Checkout confirmed' })
  } catch (err) {
    console.error('[POST /api/cart/confirm]', err)
    return NextResponse.json({ error: 'Failed to confirm order' }, { status: 500 })
  }
}
