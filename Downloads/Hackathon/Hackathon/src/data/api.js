// SHARED CONTRACT
export const FAIL_RATE = 0.2

export async function getProducts(){
  await new Promise(r=>setTimeout(r,300))
  try{
    const res = await fetch(new URL('./products.json', import.meta.url),{cache:'force-cache'})
    if(!res.ok) throw new Error('Failed to load products')
    const data = await res.json()
    if(!Array.isArray(data) || data.length===0) throw new Error('Empty products')
    return data
  }catch(err){
    console.error('getProducts error', err)
    // deterministic fallback to avoid reload loop
    return [
      {id:"p1",name:"White Tote Bag",category:"Accessories",price:15,mrp:25,rating:4.6,reviewCount:128,image:"https://picsum.photos/seed/p1/400/500",stock:20,createdAt:"2024-01-01"},
      {id:"p2",name:"Beige Fedora Hat",category:"Women Fashion",price:45.99,mrp:69.99,rating:4.8,reviewCount:210,image:"https://picsum.photos/seed/p2/400/500",stock:12,createdAt:"2024-02-10"},
      {id:"p3",name:"Black Running Shoes",category:"Men Fashion",price:25.5,mrp:45,rating:4.4,reviewCount:95,image:"https://picsum.photos/seed/p3/400/500",stock:30,createdAt:"2024-03-05"}
    ]
  }
}

export async function addToCartApi(_product){
  await new Promise(r=>setTimeout(r,500))
  if(Math.random()<FAIL_RATE) throw new Error('Network error')
  return {ok:true}
}
