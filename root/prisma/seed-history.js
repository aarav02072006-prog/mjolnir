const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Generating mock price history...')
  
  const products = await prisma.product.findMany({
    select: { id: true, discountedPrice: true }
  })

  console.log(`Found ${products.length} products.`)

  let count = 0
  const now = new Date()

  for (const product of products) {
    const historyData = []
    
    // Generate 10-15 random data points over the last 90 days
    const numPoints = Math.floor(Math.random() * 6) + 10 // 10 to 15
    let currentPrice = product.discountedPrice
    
    // Create current price point
    historyData.push({
      productId: product.id,
      price: currentPrice,
      recordedAt: now
    })

    // Walk backward in time
    for (let i = 1; i < numPoints; i++) {
      // Random days ago (distribute roughly evenly)
      const daysAgo = Math.floor((90 / numPoints) * i)
      const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
      
      // Random price fluctuation between -15% and +25%
      const fluctuation = 1 + (Math.random() * 0.4 - 0.15)
      const historicalPrice = Math.round(currentPrice * fluctuation)
      
      historyData.push({
        productId: product.id,
        price: historicalPrice,
        recordedAt: date
      })
      
      currentPrice = historicalPrice // Walk backwards using previous price
    }

    await prisma.priceHistory.createMany({
      data: historyData
    })
    
    count++
    if (count % 500 === 0) console.log(`Processed ${count} products...`)
  }

  console.log('Finished generating price history!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
