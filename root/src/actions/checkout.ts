'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

type CheckoutItem = {
  productId: string
  quantity: number
}

export async function checkoutAction(items: CheckoutItem[]) {
  // In a real app, this would come from the auth session
  const userId = 'demo@meesho.com' 

  try {
    const user = await prisma.user.findUnique({
      where: { email: userId }
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Attempt Concurrency-Safe Transaction
    const result = await prisma.$transaction(async (tx) => {
      
      const lockedItems = []
      let totalAmount = 0

      // 1. Check existing locks to see if inventory is available
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        })

        if (!product || product.availability === 'Out of Stock') {
          throw new Error(`Product ${product?.title || item.productId} is out of stock.`)
        }

        // Check active locks for this product
        const now = new Date()
        const activeLocks = await tx.flashCheckoutLock.findMany({
          where: {
            productId: item.productId,
            expiresAt: { gt: now }
          }
        })

        const lockedQuantity = activeLocks.reduce((acc, lock) => acc + lock.quantity, 0)
        
        // For simulation purposes, let's assume each product only has 10 units in stock total
        // In a real db, we'd have a `stockCount` column.
        const simulatedTotalStock = 10 
        
        if (simulatedTotalStock - lockedQuantity < item.quantity) {
          throw new Error(`Only ${simulatedTotalStock - lockedQuantity} units available for ${product.title} due to flash sale demand.`)
        }

        totalAmount += product.discountedPrice * item.quantity
        
        lockedItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.discountedPrice
        })
      }

      // 2. Create the Order
      const order = await tx.order.create({
        data: {
          userId: user.id,
          total: totalAmount,
          status: 'COMPLETED', // Or PENDING if payment is required
          items: {
            create: lockedItems.map(li => ({
              productId: li.productId,
              quantity: li.quantity,
              price: li.price
            }))
          }
        }
      })

      // 3. Create Flash Checkout Locks (valid for 3 minutes)
      const expiresAt = new Date(new Date().getTime() + 3 * 60000) // 3 mins from now
      
      for (const li of lockedItems) {
        await tx.flashCheckoutLock.create({
          data: {
            productId: li.productId,
            userId: user.id,
            quantity: li.quantity,
            expiresAt: expiresAt
          }
        })
      }

      return order
    }, {
      maxWait: 5000, 
      timeout: 10000, 
    })

    revalidatePath('/')
    return { success: true, orderId: result.id }

  } catch (error: any) {
    console.error('Checkout error:', error)
    return { success: false, error: error.message || 'Failed to process checkout due to high demand.' }
  }
}
