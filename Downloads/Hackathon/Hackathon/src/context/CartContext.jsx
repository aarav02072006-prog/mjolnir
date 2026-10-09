import { createContext, useContext, useState, useMemo } from 'react'

const CartContext = createContext(null)

export function CartProvider({children}){
  const [items,setItems] = useState([])

  const addItem = (product,qty=1)=>{
    setItems(prev=>{
      const existing = prev.find(i=>i.id===product.id)
      if(existing){
        return prev.map(i=>i.id===product.id?{...i,qty:i.qty+qty}:i)
      }
      return [...prev,{id:product.id,name:product.name,price:product.price,image:product.image,qty}]
    })
  }
  const removeItem = (id)=> setItems(prev=>prev.filter(i=>i.id!==id))
  const updateQty = (id,qty)=>{
    if(qty<=0){removeItem(id);return}
    setItems(prev=>prev.map(i=>i.id===id?{...i,qty}:i))
  }
  const clearCart = ()=> setItems([])

  const value = useMemo(()=>({items,addItem,removeItem,updateQty,clearCart}),[items])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(){ const ctx = useContext(CartContext); if(!ctx) throw new Error('useCart must be used within CartProvider'); return ctx }

export function useCartTotals(){
  const {items}=useCart()
  const count = items.reduce((s,i)=>s+i.qty,0)
  const subtotal = items.reduce((s,i)=>s+i.price*i.qty,0)
  const mrpTotal = items.reduce((s,i)=>s+i.price*i.qty,0) // placeholder
  const savings = 0
  return {count,subtotal,mrpTotal,savings}
}
