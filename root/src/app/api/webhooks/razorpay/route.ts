import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!secret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload.payment.entity
      const razorpayOrderId = paymentEntity.order_id
      const razorpayPaymentId = paymentEntity.id

      // Find internal order by razorpayOrderId
      const order = await prisma.order.findUnique({
        where: { razorpayOrderId }
      })

      if (!order) {
        return NextResponse.json({ error: 'Order not found for webhook' }, { status: 404 })
      }

      if (order.status !== 'COMPLETED') {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: 'COMPLETED',
              razorpayPaymentId
            }
          })
          await tx.flashCheckoutLock.deleteMany({
            where: { userId: order.userId }
          })
        })
      }
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('[POST /api/webhooks/razorpay]', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
