import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import Layout from './components/layout/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

const ProductListingPage = lazy(() => import('./pages/ProductListingPage.jsx'))

function ScrollToTop(){
  const location = useLocation()
  useEffect(()=>{window.scrollTo(0,0)},[location.pathname])
  return null
}

function Protected({children}){
  // simple guard: redirect handled in CheckoutPage
  return children
}

export default function App(){
  return (
    <>
      <ScrollToTop/>
      <Routes>
        <Route element={<Layout/>}>
          <Route path="/" element={<HomePage/>}/>
          <Route path="/products" element={<Suspense fallback={<div>Loading...</div>}><ProductListingPage/></Suspense>}/>
          <Route path="/product/:id" element={<ProductDetailPage/>}/>
          <Route path="/cart" element={<CartPage/>}/>
          <Route path="/checkout" element={<Protected><CheckoutPage/></Protected>}/>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="*" element={<NotFoundPage/>}/>
        </Route>
      </Routes>
    </>
  )
}
