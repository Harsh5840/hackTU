# Hackathon Demo Instructions

## 1. Start Infrastructure & Services
Run:
```bash
docker-compose up --build -d
```

## 2. Seed Data
Check if the services have created their schemas. Then run:
```bash
docker exec -i mc_postgres psql -U admin -d supply_chain_db < scripts/seed_data.sql
```
*Note: You might need to adjust Schema names in the SQL file if Prisma generated different ones.*

## 3. Demo Flow (Backend API)

### A. Auth
- **Login as Admin**: `POST /auth/login`
- **Register Dealer**: `POST /dealers/register` (Triggers `dealer.registered` -> Email Notification)

### B. Inventory & Analytics (The "AI" Part)
- **Check Stock**: `GET /api/inventory/warehouses/wh-1`
- **Predict Demand**: `POST /api/v1/forecast/demand` (Analytics Service)
  - Payload: `{"productId": "prod-1", "history": [{"date": "2024-01-01", "quantity": 10}, ...]}`
- **Get Stock Recommendations** (Bonus): `POST /api/v1/recommend/stock`
  - Shows "Restock" or "Liquidate" suggestions based on DoS logic.

### C. Real-time Events
- **Place Order**: `POST /orders/create`
  - Watch `notification-service` logs. It should consume `order.created` event.
