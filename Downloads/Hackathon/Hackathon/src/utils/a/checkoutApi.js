export async function reserveStock(items){
  await new Promise(r=>setTimeout(r,400))
  const reservedUntil = Date.now()+3*60*1000
  return {reservedUntil}
}
export async function placeOrder(items){
  await new Promise(r=>setTimeout(r,800))
  if(items.length===0) throw new Error('Cart empty')
  // simulate random stock out
  if(Math.random()<0.05) throw new Error('Item just sold out')
  return {orderId:'ORD'+Math.floor(Math.random()*1000000)}
}
