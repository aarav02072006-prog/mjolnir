import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

type CheckoutItem = { productId: string; quantity: number }

export async function POST(req: NextRequest) {
  // 1. Authenticate
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Please login to checkout' }, { status: 401 })
  }

  // 2. Parse and validate body
  let items: CheckoutItem[]
  try {
    const body = await req.json()
    items = body.items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }
    for (const item of items) {
      if (!item.productId || typeof item.quantity !== 'number' || item.quantity < 1) {
        return NextResponse.json({ error: 'Invalid item in cart' }, { status: 400 })
      }
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // 3. Run reservation in a serializable transaction
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        let totalAmount = 0
        const reservedItems: { productId: string; quantity: number; price: number }[] = []

        for (const item of items) {
          // Fetch product with server-side price
          const product = await tx.product.findUnique({ where: { id: item.productId } })

          if (!product) {
            throw { status: 404, message: `Product not found: ${item.productId}` }
          }
          if (product.availability === 'Out of Stock' || product.stockCount < item.quantity) {
            throw { status: 409, message: `Only ${product.stockCount} unit(s) available for "${product.title}"` }
          }

          // Atomically decrement stock
          await tx.product.update({
            where: { id: item.productId },
            data: { stockCount: { decrement: item.quantity } },
          })

          totalAmount += product.discountedPrice * item.quantity
          reservedItems.push({
            productId: item.productId,
            quantity: item.quantity,
            price: product.discountedPrice, // server-side price snapshot
          })
        }

        // Create PENDING order with price snapshots
        const order = await tx.order.create({
          data: {
            userId: user.id,
            total: Math.round(totalAmount * 100) / 100,
            status: 'PENDING',
            items: {
              create: reservedItems.map((ri) => ({
                productId: ri.productId,
                quantity: ri.quantity,
                price: ri.price,
              })),
            },
          },
        })

        // Create 3-minute reservation locks (linked to order via reservationId)
        const expiresAt = new Date(Date.now() + 180_000)
        await tx.flashCheckoutLock.createMany({
          data: reservedItems.map((ri) => ({
            productId: ri.productId,
            userId: user.id,
            quantity: ri.quantity,
            expiresAt,
          })),
        })

        // Tie the locks to the order idempotency key
        await tx.order.update({
          where: { id: order.id },
          data: { reservationId: order.id } 
        })

        return { order, expiresAt, total: totalAmount }
      },
      { isolationLevel: 'Serializable', maxWait: 5000, timeout: 10000 }
    )

    return NextResponse.json({
      success: true,
      orderId: result.order.id,
      total: result.total,
      reservationExpiresAt: result.expiresAt.toISOString(),
      message: 'Inventory reserved for 3 minutes. Please confirm checkout.',
    })
  } catch (err: any) {
    if (err.status === 409 || err.status === 404) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/cart/checkout]', err)
    return NextResponse.json({ error: 'Checkout failed. Please try again.', details: err.message, stack: err.stack }, { status: 500 })
  }
}
