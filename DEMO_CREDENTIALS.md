# 🔐 Modern Colours - Demo Credentials

## Admin Credentials

### Super Admin
```
Email:    admin@moderncolours.com
Password: admin123
Role:     SUPER_ADMIN
Access:   Full system access
```

**Capabilities:**
- ✅ View and manage all products
- ✅ Manage inventory across all warehouses
- ✅ View and process all orders
- ✅ Manage dealer accounts and verification
- ✅ Access analytics and forecasts
- ✅ Approve/reject dealer registrations
- ✅ View all Telegram bot interactions

**Login URL:** `http://localhost:3001/login` (Frontend)

---

## Dealer Credentials

### Dealer 1 - Rajesh Gupta
```
Email:    dealer1@example.com
Password: dealer123
Role:     DEALER
Business: Gupta Paints & Hardware
Location: Jaipur, Rajasthan
```

**Capabilities:**
- ✅ View product catalog
- ✅ Place orders
- ✅ Track own orders
- ✅ Manage business profile
- ✅ View credit limit and outstanding
- ✅ Access dealer hierarchy
- 🚫 Cannot access other dealers' data
- 🚫 Cannot manage products or inventory

**Login URL:** `http://localhost:3001/login` (Frontend)

---

## Buyer/User Credentials

### Buyer 1 - Amit Kumar
```
Email:    buyer1@example.com
Password: buyer123
Role:     BUYER
Access:   /buyer dashboard
```

**Capabilities:**
- ✅ View product catalog with prices
- ✅ Place orders through web or Telegram
- ✅ Track order status and delivery
- ✅ View order history
- ✅ Manage profile
- ✅ Access Telegram bot for quick orders
- 🚫 Cannot access admin or dealer sections

### Buyer 2 - Priya Sharma
```
Email:    buyer2@example.com
Password: buyer123
Role:     BUYER
Access:   /buyer dashboard
```

**Login URL:** `http://localhost:3001/login` (Frontend)

---

### Telegram Bot Users
**No password required** - Direct Telegram access

**Bot Username:** `@ModernColoursBot`

**Setup Instructions:**
1. Open Telegram
2. Search for `@ModernColoursBot`
3. Click `/start` to begin
4. Use `/order` to place orders
5. Use `/track <orderId>` to track orders
6. Use `/products` to browse catalog
7. Use `/analytics` to view forecasts

**Buyer Commands:**
- `/start` - Welcome message
- `/order` - Place new order (7-step process)
- `/track <orderId>` - Track order status
- `/products` - Browse product catalog
- `/analytics` - View demand forecast
- `/help` - Get help

**Buyer Web Dashboard Features:**
- ✅ View product catalog with prices
- ✅ Track orders and delivery status
- ✅ Quick link to Telegram bot
- ✅ Order history
- ✅ Profile management
- 📱 Optimized for mobile and desktop

**Note:** Most buyers use Telegram bot for ordering (faster and more convenient)

---

## Test Accounts Creation

### Create Additional Users via API

#### Register New Dealer
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dealer2@example.com",
    "password": "dealer123",
    "firstName": "Amit",
    "lastName": "Sharma",
    "role": "DEALER",
    "businessName": "Sharma Paint Store",
    "phone": "9876543211",
    "city": "Mumbai",
    "state": "Maharashtra"
  }'
```

#### Register New Admin
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin2@moderncolours.com",
    "password": "admin123",
    "firstName": "Priya",
    "lastName": "Patel",
    "role": "ADMIN"
  }'
```

---

## Authentication Tokens

### Get JWT Token
```bash
# Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@moderncolours.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "admin@moderncolours.com",
      "role": "SUPER_ADMIN",
      "firstName": "Super",
      "lastName": "Admin"
    }
  }
}
```

### Use Token in Requests
```bash
# Example: List all dealers (admin only)
curl -X GET http://localhost:3000/api/dealers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Quick Access URLs

### Frontend
- **Login Page:** `http://localhost:3001/login`
- **Admin Dashboard:** `http://localhost:3001/admin`
- **Dealer Dashboard:** `http://localhost:3001/dealer`
- **Buyer Dashboard:** `http://localhost:3001/buyer`
- **Products:** `http://localhost:3001/admin/products`
- **Orders:** `http://localhost:3001/admin/orders`
- **Dealers:** `http://localhost:3001/admin/dealers`
- **Analytics:** `http://localhost:3001/admin/analytics`

### Backend APIs
- **API Gateway:** `http://localhost:3000`
- **Auth Service:** `http://localhost:3001`
- **Inventory Service:** `http://localhost:3002`
- **Order Service:** `http://localhost:3003`
- **Dealer Service:** `http://localhost:3004`
- **Analytics Service:** `http://localhost:8000`

### Telegram Bot
- **Bot Link:** `https://t.me/ModernColoursBot`
- Search in Telegram: `@ModernColoursBot`

---

## Database Direct Access (Development Only)

### PostgreSQL Connection
```bash
# Via Docker
docker exec -it mc_postgres psql -U postgres

# Connect to database
\c modern_colours

# View users
SELECT email, role, "firstName", "lastName" FROM "User";

# View dealers
SELECT "businessName", email, "dealerTier", "verificationStatus" 
FROM "Dealer";
```

---

## Role Comparison

| Feature | Super Admin | Dealer | Buyer (Telegram) |
|---------|------------|--------|------------------|
| Login to Frontend | ✅ | ✅ | ❌ |
| View All Products | ✅ | ✅ | ✅ (via bot) |
| Manage Products | ✅ | ❌ | ❌ |
| Place Orders | ✅ | ✅ | ✅ (via bot) |
| View All Orders | ✅ | ❌ (own only) | ❌ (own only) |
| Approve Orders | ✅ | ❌ | ❌ |
| Manage Dealers | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ✅ (limited) | ✅ (via bot) |
| Manage Inventory | ✅ | ❌ | ❌ |
| Telegram Bot Admin | ✅ | ❌ | ❌ |

---

## Security Notes

⚠️ **These are DEMO credentials for development only**

**Production Checklist:**
- [ ] Change all default passwords
- [ ] Implement password complexity rules
- [ ] Enable 2FA for admin accounts
- [ ] Set up API rate limiting
- [ ] Configure CORS for production domains
- [ ] Use environment-specific JWT secrets
- [ ] Enable audit logging
- [ ] Set up session timeout
- [ ] Implement account lockout after failed attempts

---

## Testing Workflows

### 1. Admin Workflow
1. Login as admin: `admin@moderncolours.com` / `admin123`
2. Navigate to Products page
3. Create new product
4. Navigate to Dealers page
5. Approve pending dealer
6. View analytics dashboard

### 2. Dealer Workflow
1. Login as dealer: `dealer1@example.com` / `dealer123`
2. Browse product catalog
3. Place order
4. View order history
5. Update business profile

### 3. Buyer Workflow (Telegram)
1. Open Telegram, search `@ModernColoursBot`
2. Send `/start`
3. Send `/order`
4. Complete 7-step order process:
   - Select state
   - Enter city
   - Enter PIN code
   - Enter address
   - Enter landmark
   - Enter quantity
   - Confirm
5. Send `/track <orderId>` to track order

---

## Troubleshooting Login Issues

### Frontend Login Not Working
```bash
# Check auth service is running
docker logs mc_auth_service --tail 20

# Test login API directly
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@moderncolours.com", "password": "admin123"}'
```

### Telegram Bot Not Responding
```bash
# Check notification service logs
docker logs mc_notification_service --tail 30

# Restart notification service
docker-compose restart notification-service
```

### "Unauthorized" Errors
- Check if JWT token is included in Authorization header
- Verify token hasn't expired (24h default)
- Re-login to get fresh token

---

**Last Updated:** February 7, 2026
**Environment:** Development
**Status:** ✅ All services operational
