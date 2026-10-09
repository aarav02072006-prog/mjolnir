import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internal_order_id } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !internal_order_id) {
      return NextResponse.json({ error: 'Missing payment parameters' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: internal_order_id }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json({ error: 'Invalid order ID mismatch' }, { status: 400 })
    }

    if (order.status === 'COMPLETED') {
      return NextResponse.json({ success: true, message: 'Order already completed' })
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET!
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex')

    // Use constant-time comparison
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature)
    )

    if (!isSignatureValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Process completion atomically
    await prisma.$transaction(async (tx) => {
      // 1. Mark order as COMPLETED
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          razorpayPaymentId: razorpay_payment_id
        }
      })

      // 2. Remove the locks (inventory is permanently deducted now)
      await tx.flashCheckoutLock.deleteMany({
        where: { userId: user.id }
      })
    })

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('[POST /api/payments/verify]', err)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}
