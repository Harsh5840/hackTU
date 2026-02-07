# API Routes Documentation

## All Service Routes - Complete Overview

### 1. Auth Service (Port 3001)
**Base Path:** `/api/auth`

| Method | Endpoint | Description | Body Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | email, password, firstName, lastName |
| POST | `/api/auth/login` | User login | email, password |
| POST | `/api/auth/forgot-password` | Request password reset | email |
| POST | `/api/auth/reset-password` | Reset password with code | email, code, newPassword |

---

### 2. Inventory Service (Port 3002)
**Base Path:** `/api/inventory`

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/inventory/products` | List all products | - |
| GET | `/api/inventory/warehouses` | List all warehouses | - |
| GET | `/api/inventory/warehouses/:warehouseId` | Get specific warehouse inventory | warehouseId (path) |
| POST | `/api/inventory/adjust` | Adjust stock levels | productId, warehouseId, quantity, type |

**Response Format:**
```json
{
  "success": true,
  "data": [...]
}
```

---

### 3. Order Service (Port 3003)
**Base Path:** `/api/orders`

| Method | Endpoint | Description | Query/Body Params |
|--------|----------|-------------|-------------------|
| GET | `/api/orders` | ✅ **NEW** List all orders | `?dealerId=&status=&limit=50` |
| POST | `/api/orders/create` | Create new order | dealerId, items[], deliveryAddress |
| GET | `/api/orders/:id` | Get specific order | id (path) |

**Response Format:**
```json
{
  "success": true,
  "data": {...} or [...]
}
```

---

### 4. Dealer Service (Port 3004)
**Base Path:** `/api/dealers`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/dealers/register` | Register new dealer | No |
| GET | `/api/dealers/me` | Get current dealer profile | Yes (JWT) |
| PUT | `/api/dealers/me/profile` | Update dealer profile | Yes (JWT) |
| GET | `/api/dealers/hierarchy` | Get dealer hierarchy | Yes (JWT) |

---

### 5. Analytics Service (Port 8000)
**Base Path:** `/api/v1` (rewritten from `/api/analytics` by gateway)

| Method | Endpoint | Description | Body Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/forecast/demand` | Forecast product demand | productId, history[] |
| POST | `/api/v1/recommend/stock` | Get stock recommendations | inventory[], salesVelocity[] |
| GET | `/health` | Health check | - |

**Via API Gateway:** Use `/api/analytics/forecast/demand` or `/api/analytics/recommend/stock`

---

### 6. API Gateway (Port 3000)
**Routes Configuration:**

| Path | Proxies To | Authentication |
|------|-----------|----------------|
| `/api/auth` | auth-service:3001 | ❌ No (public) |
| `/api/inventory` | inventory-service:3002 | ✅ Yes (JWT) |
| `/api/orders` | order-service:3003 | ✅ Yes (JWT) |
| `/api/dealers` | dealer-service:3004 | ✅ Yes (JWT) |
| `/api/analytics` | analytics-service:8000 | ✅ Yes (JWT) |
| `/health` | Gateway health | ❌ No |

**Authentication:** All `/api/*` routes except `/api/auth` require JWT token in `Authorization: Bearer <token>` header.

---

### 7. Notification Service (Port 3005)
**Telegram Bot Commands:**

#### Buyer Commands:
- `/start` - Welcome message and help
- `/help` - Show all available commands
- `/products` - Browse available products ✅ Fixed
- `/order` - Start new order flow
- `/myorders` - View order tracking info
- `/track <orderId>` - Track specific order

#### Admin Commands (ID: 6140979307):
- `/dashboard` - System overview ✅ Fixed
- `/orders` - List recent orders ✅ Fixed
- `/inventory` - View warehouse inventory ✅ Fixed
- `/analytics` - Generate analytics
- `/broadcast <message>` - Send message to all users

**Direct Service Calls (bypasses auth):**
- `GET http://inventory-service:3002/api/inventory/products` ✅
- `GET http://inventory-service:3002/api/inventory/warehouses` ✅
- `GET http://order-service:3003/api/orders?limit=10` ✅
- `GET http://order-service:3003/api/orders/:id` ✅

---

## Recent Fixes Applied

### ✅ Order Service
- **Added:** `GET /api/orders` endpoint with filters (dealerId, status, limit)
- **Added:** `getAllOrders()` service method
- **Added:** `getAllOrders()` controller

### ✅ Notification Service (Telegram Bot)
- **Fixed:** Products command to handle `{success: true, data: []}` format
- **Fixed:** Orders command to fetch from new list endpoint
- **Fixed:** Inventory command to handle response format
- **Fixed:** Dashboard to show product count without failing orders

### ✅ Response Format Standardization
All services now use consistent response format:
```json
{
  "success": true|false,
  "data": {...} or [...],
  "message": "error message" // only on errors
}
```

---

## Testing Commands

```bash
# Test inventory products
docker exec mc_inventory_service wget -qO- http://localhost:3002/api/inventory/products

# Test warehouses
docker exec mc_inventory_service wget -qO- http://localhost:3002/api/inventory/warehouses

# Test orders list (NEW)
docker exec mc_order_service wget -qO- http://localhost:3003/api/orders?limit=5

# Test specific order
docker exec mc_order_service wget -qO- http://localhost:3003/api/orders/<order-id>

# Check all services status
docker-compose ps

# View service logs
docker logs mc_notification_service --tail 30
docker logs mc_order_service --tail 30
```

---

## Service Health Check Endpoints

| Service | Health Endpoint | Port |
|---------|----------------|------|
| API Gateway | `GET /health` | 3000 |
| Auth Service | `GET /health` | 3001 |
| Inventory Service | `GET /health` | 3002 |
| Order Service | `GET /health` | 3003 |
| Dealer Service | `GET /health` | 3004 |
| Notification Service | `GET /health` | 3005 |
| Analytics Service | `GET /health` | 8000 |

---

## Database Seeding

```bash
# Seed inventory products
docker exec mc_inventory_service npx prisma db seed

# Current seeded data:
# - Warehouse: "Main Request Warehouse"
# - Category: "Interior Paints"
# - Product: "Ultra White Satin" (SKU: P-100, Price: ₹1200)
# - Initial stock: 100 units
```

---

## Environment Configuration

### Required Environment Variables:
- `TELEGRAM_BOT_TOKEN=8536657106:AAHYWSg21Fmk6UUJ7K3fqIgEvbFn0s00guI`
- `TELEGRAM_ADMIN_IDS=6140979307`
- `DATABASE_URL=postgresql://...`
- `RABBITMQ_URL=amqp://admin:password@rabbitmq:5672`
- `JWT_SECRET=your-secret-key`

---

## Known Issues & Workarounds

1. **Dealer Service**: Building with OpenSSL fix (add `RUN apk add --no-cache openssl` in Dockerfile)
2. **Order Service**: Previously missing list endpoint - ✅ NOW FIXED
3. **API Gateway**: Analytics service path rewriting (`/api/analytics` → `/api/v1`)

---

*Last Updated: February 7, 2026*
*All routes verified and tested*
