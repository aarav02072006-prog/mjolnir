const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// Robust CSV line parser that respects quotes
function parseCSVLine(text) {
  let ret = []
  let inQuote = false
  let value = ''
  for (let i = 0; i < text.length; i++) {
    let char = text[i]
    if (inQuote) {
      if (char === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          value += '"'
          i++
        } else {
          inQuote = false
        }
      } else {
        value += char
      }
    } else {
      if (char === '"') {
        inQuote = true
      } else if (char === ',') {
        ret.push(value)
        value = ''
      } else {
        value += char
      }
    }
  }
  ret.push(value)
  return ret.map(s => s.trim())
}

async function main() {
  console.log('--- Meesho E-Commerce Platform Seeding ---')

  // Seed demo user
  const hashedPassword = await bcrypt.hash('demo123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'demo@meesho.com' },
    update: { password: hashedPassword, name: 'Demo User', role: 'user' },
    create: {
      email: 'demo@meesho.com',
      name: 'Demo User',
      password: hashedPassword,
      role: 'user',
    },
  })
  console.log('✅ Demo user upserted: demo@meesho.com')

  // Path resolution order:
  //   1. MEESHO_DATASET_PATH env variable (absolute path on any machine)
  //   2. Relative fallback: two levels up from prisma/ → workspace root → dataset/
  const csvFilePath = process.env.MEESHO_DATASET_PATH
    ? path.resolve(process.env.MEESHO_DATASET_PATH)
    : path.resolve(__dirname, '../../dataset/meesho_dataset-main/meesho_generated.csv')

  if (!fs.existsSync(csvFilePath)) {
    console.error(`\n❌ CRITICAL: Dataset CSV not found.`)
    console.error(`   Looked at: ${csvFilePath}`)
    console.error(`\n   Fix options:`)
    console.error(`   A) Set MEESHO_DATASET_PATH in your .env.local to the absolute path of meesho_generated.csv`)
    console.error(`   B) Place the extracted dataset at: <workspace-root>/dataset/meesho_dataset-main/meesho_generated.csv`)
    process.exit(1)
  }

  console.log(`\n📦 Importing Organizer Dataset from: ${csvFilePath}`)
  const csvData = fs.readFileSync(csvFilePath, 'utf-8')
  const lines = csvData.split(/\r?\n/).filter(line => line.trim() !== '')

  if (lines.length < 2) {
    console.error('❌ Dataset is empty or missing headers.')
    process.exit(1)
  }

  const headers = parseCSVLine(lines[0])
  console.log(`Headers found: ${headers.length} columns`)

  let imported = 0
  let rejected = 0
  let skipped = 0
  const reasons = {}

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i])
    
    if (row.length !== headers.length) {
      rejected++
      reasons['Column mismatch'] = (reasons['Column mismatch'] || 0) + 1
      continue
    }

    const rowData = {}
    headers.forEach((h, idx) => rowData[h] = row[idx])

    if (!rowData['product_id']) {
      rejected++
      reasons['Missing product_id'] = (reasons['Missing product_id'] || 0) + 1
      continue
    }

    try {
      // Map exactly to Prisma schema types without mutating source values randomly
      const productInput = {
        title: rowData['title'] || 'Unknown Product',
        category: rowData['category'] || 'Uncategorized',
        subcategory: rowData['subcategory'] || '',
        brand: rowData['brand'] || 'Unknown Brand',
        originalPrice: parseFloat(rowData['original_price']) || 0,
        discountedPrice: parseFloat(rowData['discounted_price']) || 0,
        discountPercentage: parseFloat(rowData['discount_percentage']) || 0,
        rating: parseFloat(rowData['rating']) || 0,
        reviewCount: parseInt(rowData['review_count'], 10) || 0,
        availability: rowData['availability'] || 'In Stock',
        sellerName: rowData['seller_name'] || 'Unknown Seller',
        imageUrl: rowData['image_url'] || '',
        productUrl: rowData['product_url'] || '',
        description: rowData['description'] || '',
        colorsAvailable: rowData['colors_available'] || '',
        sizesAvailable: rowData['sizes_available'] || '',
        material: rowData['material'] || '',
        codAvailable: rowData['cod_available']?.toLowerCase() === 'true',
        returnPolicy: rowData['return_policy'] || '',
        deliveryTime: rowData['delivery_time'] || '',
      }

      // We use upsert. 
      // For updates, we DO NOT overwrite `stockCount` because inventory state is application-generated 
      // and we must not destroy it on re-import.
      // For creations, we inject synthetic demo inventory (5 to 50).
      await prisma.product.upsert({
        where: { productId: rowData['product_id'] },
        update: productInput, // stockCount is intentionally excluded from the update object
        create: {
          productId: rowData['product_id'],
          ...productInput,
          stockCount: Math.floor(Math.random() * 46) + 5, // synthetic demo data explicitly assigned
        },
      })
      imported++
      
      if (imported % 500 === 0) {
        console.log(`...imported ${imported} records`)
      }
    } catch (err) {
      rejected++
      const msg = err.message.substring(0, 50)
      reasons[msg] = (reasons[msg] || 0) + 1
    }
  }

  console.log('\n--- 📊 Import Summary ---')
  console.log(`Total Source Rows: ${lines.length - 1}`)
  console.log(`✅ Successfully Imported: ${imported}`)
  console.log(`❌ Rejected: ${rejected}`)
  
  if (rejected > 0) {
    console.log('Rejection Reasons:')
    Object.entries(reasons).forEach(([reason, count]) => {
      console.log(`  - ${reason}: ${count} rows`)
    })
  }
  
  console.log('\nNotice: Dataset does not contain native stock/inventory numbers.')
  console.log('Synthetic `stockCount` (5-50 units) has been generated for demo purposes during first import.')
  console.log('Idempotent re-imports will safely ignore existing stockCounts.\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
