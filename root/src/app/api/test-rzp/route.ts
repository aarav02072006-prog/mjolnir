
import { NextResponse } from "next/server"
import Razorpay from "razorpay"

export async function GET() {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
    const order = await razorpay.orders.create({
      amount: 100, currency: "INR", receipt: "rcpt"
    })
    return NextResponse.json({ success: true, order })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack, errObj: err })
  }
}

