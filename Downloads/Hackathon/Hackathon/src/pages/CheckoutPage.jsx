import { useEffect,useState,useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart,useCartTotals } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatPrice } from '../utils/a/formatPrice.js'
import { isValidName,isValidPhone,isValidPincode } from '../utils/a/validators.js'
import { reserveStock,placeOrder } from '../utils/a/checkoutApi.js'
import usePageTitle from '../hooks/a/usePageTitle.js'

export default function CheckoutPage(){
  usePageTitle('Checkout')
  const {user}=useAuth()
  const navigate=useNavigate()
  const {items,clearCart}=useCart()
  const {subtotal}=useCartTotals()

  const [reservedUntil,setReservedUntil]=useState(null)
  const [remaining,setRemaining]=useState(0)
  const [expired,setExpired]=useState(false)
  const [form,setForm]=useState({name:'',phone:'',pincode:'',city:'',address:''})
  const [errors,setErrors]=useState({})
  const [placing,setPlacing]=useState(false)
  const [orderId,setOrderId]=useState(null)
  const [message,setMessage]=useState('')

  useEffect(()=>{
    if(!user){ navigate('/login',{state:{from:'/checkout'}}, {replace:true}); return }
  },[user,navigate])

  const reserve = async ()=>{
    const {reservedUntil:ru}=await reserveStock(items)
    setReservedUntil(ru); setExpired(false)
  }
  useEffect(()=>{
    if(items.length===0) return
    reserve()
    const id=setInterval(()=>{
      const left = Math.max(0, Math.floor((reservedUntil-(Date.now()))/1000))
      setRemaining(left)
      if(left<=0){ setExpired(true); clearInterval(id) }
    },1000)
    return ()=>clearInterval(id)
  },[items,reservedUntil])

  const minutes = Math.floor((remaining||0)/60)
  const seconds = String((remaining||0)%60).padStart(2,'0')
  const timeStr = `${String(minutes).padStart(2,'0')}:${seconds}`

  useEffect(()=>{
    if(remaining===60||remaining===30) { /* polite announcement */ }
  },[remaining])

  const valid = useMemo(()=>{
    const e={}
    if(!isValidName(form.name)) e.name='Name too short'
    if(!isValidPhone(form.phone)) e.phone='Enter 10 digit phone'
    if(!isValidPincode(form.pincode)) e.pincode='Enter 6 digit pincode'
    if(!form.city.trim()) e.city='City required'
    if(!form.address.trim()) e.address='Address required'
    setErrors(e)
    return Object.keys(e).length===0
  },[form])

  const delivery = subtotal>=499?0:49
  const total = subtotal+delivery

  const handlePlace = async ()=>{
    setMessage('')
    if(expired){ setMessage('Reservation expired'); return }
    if(!valid){ setMessage('Fix form errors'); return }
    setPlacing(true)
    try{
      const res = await placeOrder(items)
      clearCart()
      setOrderId(res.orderId)
    }catch(err){
      setMessage(err.message||'Failed')
    }finally{ setPlacing(false) }
  }

  if(orderId){
    return (
      <div className="checkout success">
        <h1>Order placed</h1>
        <p>Order ID: {orderId}</p>
        <button onClick={()=>navigate('/')}>Home</button>
      </div>
    )
  }

  if(!user) return null

  return (
    <div className="checkout">
      <h1>Checkout</h1>
      <div aria-live="polite">
        {expired? <div className="expired">Reservation expired <button onClick={reserve}>Reserve again</button></div>
         : <div>Items reserved for {timeStr}</div>}
      </div>
      <form onSubmit={e=>{e.preventDefault();handlePlace()}} noValidate>
        <h2>Address</h2>
        <label>Name<input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} aria-invalid={!!errors.name} aria-describedby="name-err" required/></label>
        {errors.name && <div id="name-err">{errors.name}</div>}
        <label>Phone<input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} aria-invalid={!!errors.phone} aria-describedby="phone-err" required/></label>
        {errors.phone && <div id="phone-err">{errors.phone}</div>}
        <label>Pincode<input value={form.pincode} onChange={e=>setForm(f=>({...f,pincode:e.target.value}))} aria-invalid={!!errors.pincode} aria-describedby="pin-err" required/></label>
        {errors.pincode && <div id="pin-err">{errors.pincode}</div>}
        <label>City<input value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} required/></label>
        <label>Address<textarea value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} required/></label>
        <h2>Payment</h2>
        <label><input type="radio" name="pay" defaultChecked/> Cash on Delivery</label>
        <label><input type="radio" name="pay"/> UPI</label>
        <label><input type="radio" name="pay"/> Card</label>
        <div className="summary">
          <div>Subtotal {formatPrice(subtotal)}</div>
          <div>Delivery {delivery===0?'FREE':formatPrice(delivery)}</div>
          <div>Total {formatPrice(total)}</div>
        </div>
        {message && <div role="alert">{message}</div>}
        <button type="submit" disabled={expired||placing}>{placing?'Placing...':'Place order'}</button>
      </form>
    </div>
  )
}
