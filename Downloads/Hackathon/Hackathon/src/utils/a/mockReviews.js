const names=['Asha','Rahul','Meera','Karan','Priya']
export function mockReviews(productId){
  const count=3+((parseInt(productId.slice(-1)||'0')%3))
  return Array.from({length:count}).map((_,i)=>({
    name:names[i%names.length],
    stars:4+((i+productId.length)%2),
    date:new Date(Date.now()-i*86400000*7).toISOString().slice(0,10),
    comment:`Good quality product ${i+1}`
  }))
}
