import { prisma } from './prisma'

/**
 * Records a price change for a product.
 * Compares the new discountedPrice with the current one.
 * If changed, it updates the product and appends a PriceHistory record in a transaction.
 */
export async function updateProductPrice(productId: string, newDiscountedPrice: number, newOriginalPrice?: number) {
  // 1. Retrieve current product
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, discountedPrice: true, originalPrice: true }
  })

  if (!product) {
    throw new Error('Product not found')
  }

  // 2. Compare price
  if (product.discountedPrice === newDiscountedPrice) {
    // If we only want to update original price without history event
    if (newOriginalPrice !== undefined && product.originalPrice !== newOriginalPrice) {
      return prisma.product.update({
        where: { id: productId },
        data: { originalPrice: newOriginalPrice }
      })
    }
    return product
  }

  // 3 & 4 & 5. If changed, record the new price and update product in a transaction
  return prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: {
        discountedPrice: newDiscountedPrice,
        ...(newOriginalPrice !== undefined && { originalPrice: newOriginalPrice })
      }
    }),
    prisma.priceHistory.create({
      data: {
        productId: productId,
        price: newDiscountedPrice, // Track the discounted (customer-facing) price
        recordedAt: new Date()
      }
    })
  ])
}
