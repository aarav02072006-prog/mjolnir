import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import Razorpay from 'razorpay'

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json({ error: 'Order is not pending' }, { status: 400 })
    }

    // Verify inventory lock hasn't expired
    // The lock was created with userId and productId, let's just check if any locks exist for this user with future expiresAt
    const locks = await prisma.flashCheckoutLock.findMany({
      where: {
        userId: user.id,
        expiresAt: { gt: new Date() }
      }
    })

    if (locks.length === 0) {
       return NextResponse.json({ error: 'Reservation expired. Please try checking out again.' }, { status: 400 })
    }

    // Amount in paise
    const amountInPaise = Math.round(order.total * 100)

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Payment gateway not configured correctly.' }, { status: 500 })
    }

    const authHeader = 'Basic ' + Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')

    const https = require('https')

    const rzpOrder: any = await new Promise((resolve, reject) => {
      const data = JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${order.id.slice(0, 8)}`,
      })

      const req = https.request({
        hostname: 'api.razorpay.com',
        port: 443,
        path: '/v1/orders',
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      }, (res: any) => {
        let body = ''
        res.on('data', (chunk: any) => body += chunk)
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(body))
          } else {
            reject(new Error(`Razorpay API Error: ${body}`))
          }
        })
      })

      req.on('error', (e: any) => reject(e))
      req.write(data)
      req.end()
    })

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: rzpOrder.id }
    })

    return NextResponse.json({
      success: true,
      key_id: process.env.RAZORPAY_KEY_ID,
      order_id: rzpOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      internal_order_id: order.id
    })

  } catch (err: any) {
    console.error('[POST /api/payments/create-order]', err)
    return NextResponse.json({ error: 'Failed to create payment order', details: err.message }, { status: 500 })
  }
}
