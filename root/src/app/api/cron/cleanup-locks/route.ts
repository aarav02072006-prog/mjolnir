import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/cron/cleanup-locks
 *
 * Authorized by: Authorization: Bearer <CRON_SECRET>
 *
 * 1. Finds all expired FlashCheckoutLocks.
 * 2. For each lock: deletes atomically (skip if another caller already deleted it → P2025),
 *    then restores stockCount exactly once.
 * 3. Cancels PENDING orders whose locks are ALL gone AND whose last lock has expired.
 *    Uses the order's own item product IDs as the scope — not all locks for a user.
 *
 * Concurrency-safe: the delete-before-increment pattern ensures each lock
 * restores stock exactly once even if two cleanup calls run simultaneously.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // --- Step 1: Process expired locks ---
  const expiredLocks = await prisma.flashCheckoutLock.findMany({
    where: { expiresAt: { lte: now } },
  })

  let cleaned = 0
  for (const lock of expiredLocks) {
    try {
      // Delete first. If already deleted by a concurrent caller, P2025 is thrown → skip.
      await prisma.flashCheckoutLock.delete({ where: { id: lock.id } })
      // Only restore stock if the deletion succeeded.
      await prisma.product.update({
        where: { id: lock.productId },
        data: { stockCount: { increment: lock.quantity } },
      })
      cleaned++
    } catch (err: any) {
      if (err.code !== 'P2025') {
        // Unexpected error — log and continue so other locks are still processed.
        console.error(`[cron/cleanup-locks] Failed to clean lock ${lock.id}:`, err)
      }
      // P2025 = already deleted by concurrent call — silently skip.
    }
  }

  // --- Step 2: Cancel PENDING orders whose reservation is fully gone ---
  //
  // "Fully gone" means: the order has no active FlashCheckoutLocks remaining
  // for its own product IDs. We scope by the order's items, not by userId,
  // so one user's valid reservation cannot block another order from being cancelled.
  const pendingOrders = await prisma.order.findMany({
    where: { status: 'PENDING' },
    include: { items: { select: { productId: true } } },
  })

  let cancelled = 0
  for (const order of pendingOrders) {
    const orderProductIds = order.items.map((i) => i.productId)
    if (orderProductIds.length === 0) {
      // Malformed order with no items — cancel it.
      await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } })
      cancelled++
      continue
    }

    // Check for any UNEXPIRED lock for this order's products and user.
    const remainingLock = await prisma.flashCheckoutLock.findFirst({
      where: {
        userId: order.userId,
        productId: { in: orderProductIds },
        expiresAt: { gt: now }, // still valid
      },
    })

    if (!remainingLock) {
      // No valid lock remains for this order → cancel it.
      await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } })
      cancelled++
    }
  }

  console.log(
    `[cron/cleanup-locks] Cleaned ${cleaned} expired locks, cancelled ${cancelled} orders`
  )
  return NextResponse.json({
    cleaned,
    cancelled,
    total: expiredLocks.length,
    message: `Cleaned ${cleaned} lock(s), cancelled ${cancelled} order(s)`,
  })
}
