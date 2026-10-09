# Dev A - Meesho Clone

Run: npm install react-router-dom && npm run dev

My files:
src/main.jsx, src/App.jsx, src/index.css
src/context/, src/pages/HomePage.jsx, ProductDetailPage.jsx, CartPage.jsx, CheckoutPage.jsx, LoginPage.jsx, NotFoundPage.jsx
src/components/layout/, src/components/ui/, src/components/product/
src/hooks/a/usePageTitle.js
src/utils/a/ (formatPrice, validators, auth, mockReviews, checkoutApi)
src/styles/

Expect from Dev B:
- ProductListingPage.jsx default export at /products, uses getProducts, uses useCart() interface
- Uses CSS variables

Shared contracts:
api.js: getProducts() -> Promise<Product[]>, addToCartApi(product)->Promise, FAIL_RATE=0.2
CartContext: items, addItem, removeItem, updateQty, clearCart
useCartTotals: count, subtotal, mrpTotal, savings

git add command (do NOT commit stubs):
git add src/main.jsx src/App.jsx src/index.css src/context src/pages/HomePage.jsx src/pages/ProductDetailPage.jsx src/pages/CartPage.jsx src/pages/CheckoutPage.jsx src/pages/LoginPage.jsx src/pages/NotFoundPage.jsx src/components/layout src/components/ui src/components/product src/hooks/a src/utils/a src/styles index.html package.json package-lock.json .gitignore README_DEVA.md

Do NOT commit:
src/pages/ProductListingPage.jsx
src/data/products.json
src/data/api.js only if Dev B has not pushed yet
