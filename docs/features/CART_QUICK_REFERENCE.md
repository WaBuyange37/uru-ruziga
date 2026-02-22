# Cart System - Quick Reference Card

## 🔒 Security Principles

### NEVER Trust Client
```typescript
// ❌ WRONG - Security vulnerability
const userId = req.body.userId

// ✅ CORRECT - Server-verified only
const payload = await verifyToken(token)
const userId = payload.userId
```

### ALWAYS Verify Ownership
```typescript
// Before any update/delete
const item = await prisma.cartItem.findUnique({
  where: { id: itemId },
  include: { cart: { select: { userId: true } } }
})

if (item.cart.userId !== payload.userId) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### ALWAYS Use Transactions
```typescript
const result = await prisma.$transaction(async (tx) => {
  // Get cart
  let cart = await tx.cart.findUnique({ where: { userId } })
  
  // Verify ownership
  if (cart.userId !== userId) {
    throw new Error('Ownership mismatch')
  }
  
  // Perform operations
})
```

---

## 📋 API Routes

### GET /api/cart
**Purpose:** Fetch user's cart
**Auth:** Required
**Response:**
```json
{
  "cart": {
    "id": "cart_id",
    "userId": "user_id",
    "items": [...],
    "totalItems": 5,
    "totalPrice": 125.50
  }
}
```

### POST /api/cart/add
**Purpose:** Add item to cart
**Auth:** Required
**Body:**
```json
{
  "productId": "123",
  "title": "Product Name",
  "price": 25.99,
  "quantity": 2,
  "imageUrl": "https://..."
}
```

### PATCH /api/cart/update
**Purpose:** Update quantity
**Auth:** Required
**Body:**
```json
{
  "itemId": "item_id",
  "quantity": 5
}
```

### DELETE /api/cart/remove
**Purpose:** Remove item
**Auth:** Required
**Body:**
```json
{
  "itemId": "item_id"
}
```

### DELETE /api/cart/clear
**Purpose:** Clear all items
**Auth:** Required
**Body:** None

---

## 🎯 Client Usage

### Basic Usage
```typescript
import { useCart } from '@/app/contexts/CartContext'

function MyComponent() {
  const { 
    cart,           // Current cart items
    addToCart,      // Add item function
    removeFromCart, // Remove item function
    updateQuantity, // Update quantity function
    clearCart,      // Clear cart function
    totalItems,     // Total item count
    totalPrice,     // Total price
    loading,        // Loading state
    refreshCart     // Manual refresh
  } = useCart()

  // Add item
  await addToCart({
    productId: '123',
    title: 'Product',
    price: 25.99,
    quantity: 1,
    imageUrl: 'https://...'
  })

  // Update quantity
  await updateQuantity(itemId, 5)

  // Remove item
  await removeFromCart(itemId)

  // Clear cart
  await clearCart()
}
```

---

## 🔐 Security Checklist

### API Route Checklist
- [ ] Extract token from Authorization header
- [ ] Verify token with `verifyToken()`
- [ ] Extract `userId` from token payload
- [ ] Verify user exists in database
- [ ] Use server-verified `userId` in all queries
- [ ] Verify ownership before update/delete
- [ ] Use transactions for atomic operations
- [ ] Validate input with Zod schemas
- [ ] Return proper HTTP status codes
- [ ] Don't expose internal errors

### Client Checklist
- [ ] Detect user changes with `useRef`
- [ ] Clear cart state on user change
- [ ] Handle session expiry (401)
- [ ] Implement optimistic UI
- [ ] Rollback on error
- [ ] Debounce rapid updates
- [ ] Show loading states
- [ ] Display error messages

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Trusting Client User ID
```typescript
// WRONG
const userId = req.body.userId
const cart = await prisma.cart.findUnique({ where: { userId } })
```

### ✅ Fix: Use Server-Verified User ID
```typescript
// CORRECT
const payload = await verifyToken(token)
const cart = await prisma.cart.findUnique({ 
  where: { userId: payload.userId } 
})
```

---

### ❌ Mistake 2: Not Verifying Ownership
```typescript
// WRONG
await prisma.cartItem.update({
  where: { id: itemId },
  data: { quantity }
})
```

### ✅ Fix: Verify Ownership First
```typescript
// CORRECT
const item = await prisma.cartItem.findUnique({
  where: { id: itemId },
  include: { cart: { select: { userId: true } } }
})

if (item.cart.userId !== payload.userId) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

await prisma.cartItem.update({
  where: { id: itemId },
  data: { quantity }
})
```

---

### ❌ Mistake 3: Not Clearing Cart on User Change
```typescript
// WRONG
useEffect(() => {
  refreshCart()
}, [user])
```

### ✅ Fix: Clear Cart First
```typescript
// CORRECT
const currentUserIdRef = useRef<string | null>(null)

useEffect(() => {
  const newUserId = user?.id || null
  
  if (currentUserIdRef.current !== newUserId) {
    setCart([])  // Clear first!
    currentUserIdRef.current = newUserId
    if (newUserId) {
      refreshCart()
    }
  }
}, [user?.id])
```

---

### ❌ Mistake 4: Not Handling Session Expiry
```typescript
// WRONG
const response = await fetch('/api/cart')
const data = await response.json()
setCart(data.cart.items)
```

### ✅ Fix: Check Status Code
```typescript
// CORRECT
const response = await fetch('/api/cart')

if (response.status === 401) {
  logout()
  setCart([])
  return
}

const data = await response.json()
setCart(data.cart.items)
```

---

## 🎯 Testing Quick Commands

### Test User Isolation
```bash
# Login as User A
TOKEN_A=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"password"}' \
  | jq -r '.token')

# Add item as User A
curl -X POST http://localhost:3000/api/cart/add \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"productId":"1","title":"Item","price":10,"quantity":1}'

# Login as User B
TOKEN_B=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@example.com","password":"password"}' \
  | jq -r '.token')

# Get User B's cart (should be empty)
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer $TOKEN_B"
```

### Test Unauthorized Access
```bash
# Should return 401
curl -X GET http://localhost:3000/api/cart
```

### Test Invalid Token
```bash
# Should return 401
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer INVALID_TOKEN"
```

---

## 📊 Performance Tips

### 1. Use Optimistic UI
```typescript
// Update UI immediately
setCart(cart.map(item => 
  item.id === itemId ? { ...item, quantity } : item
))

// Then sync with server
await fetch('/api/cart/update', { ... })
```

### 2. Debounce Rapid Updates
```typescript
const timeoutRef = useRef<NodeJS.Timeout>()

const updateQuantity = (itemId, quantity) => {
  // Update UI immediately
  setCart(...)
  
  // Debounce API call
  clearTimeout(timeoutRef.current)
  timeoutRef.current = setTimeout(() => {
    fetch('/api/cart/update', { ... })
  }, 500)
}
```

### 3. Use Transactions
```typescript
// Atomic operations
await prisma.$transaction(async (tx) => {
  // Multiple operations here
})
```

---

## 🔍 Debugging

### Check User ID
```typescript
console.log('Current user:', user?.id)
console.log('Tracked user:', currentUserIdRef.current)
```

### Check Token
```typescript
const token = localStorage.getItem('token')
console.log('Token:', token ? 'Present' : 'Missing')
```

### Check Cart State
```typescript
console.log('Cart items:', cart.length)
console.log('Total items:', totalItems)
console.log('Total price:', totalPrice)
```

### Check API Response
```typescript
const response = await fetch('/api/cart')
console.log('Status:', response.status)
console.log('Data:', await response.json())
```

---

## 📚 Documentation

- **Architecture:** `SECURE_CART_ARCHITECTURE.md`
- **Testing:** `CART_SECURITY_TESTING_GUIDE.md`
- **Summary:** `CART_IMPLEMENTATION_SUMMARY.md`
- **Quick Ref:** This file

---

## ✅ Production Checklist

- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] JWT secret configured
- [ ] All API routes secured
- [ ] Client context implemented
- [ ] User change detection working
- [ ] Session expiry handled
- [ ] Optimistic UI implemented
- [ ] Error handling complete
- [ ] Security tests passed
- [ ] Performance tests passed
- [ ] Monitoring configured
- [ ] Logging configured

---

**Status:** ✅ PRODUCTION READY
**Last Updated:** February 11, 2026
