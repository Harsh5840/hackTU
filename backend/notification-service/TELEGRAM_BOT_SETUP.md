# Telegram Bot Integration Guide

## 🚀 Overview

This notification service now includes a comprehensive Telegram bot that provides:
- 📱 Two-way communication with buyers and admins
- 🛒 Order placement via conversational chat
- 📊 Real-time notifications for order events
- 🔔 Low stock alerts for admins
- 📈 Analytics and dashboard commands

---

## 📋 Setup Instructions

### Step 1: Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` command
3. Follow the prompts to:
   - Choose a name (e.g., "Modern Colours Supply Chain")
   - Choose a username (e.g., "ModernColoursBot")
4. **Save the bot token** provided by BotFather (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Get Your Telegram User ID

1. Search for **@userinfobot** on Telegram
2. Send `/start`
3. The bot will reply with your user ID (e.g., `123456789`)
4. **Save this ID** - you'll need it for admin access

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Telegram configuration:
   ```env
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   TELEGRAM_ADMIN_IDS=123456789,987654321
   ```

   - `TELEGRAM_BOT_TOKEN`: Your bot token from BotFather
   - `TELEGRAM_ADMIN_IDS`: Comma-separated list of admin Telegram user IDs

### Step 4: Start the Service

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start

# Docker
docker-compose up notification-service
```

---

## 📱 Bot Commands

### For Buyers/Dealers

| Command | Description |
|---------|-------------|
| `/start` | Welcome message with all available commands |
| `/products` | Browse available products with order buttons |
| `/order` | Start conversational order flow |
| `/myorders` | View your recent orders |
| `/track <orderId>` | Track a specific order (e.g., `/track 123`) |
| `/help` | Get help and support information |

### For Admins

| Command | Description |
|---------|-------------|
| `/dashboard` | View system overview (orders, revenue, products) |
| `/orders` | Manage all orders with update buttons |
| `/inventory` | Check stock levels across warehouses |
| `/analytics` | View demand forecasts |
| `/broadcast <message>` | Send message to all registered users |

---

## 🛒 Order Flow Example

### Conversational Order Placement

1. **User:** `/order`
2. **Bot:** "Let's create your order. Please send me the Product ID."
3. **User:** `123`
4. **Bot:** "How many units do you want to order?"
5. **User:** `50`
6. **Bot:** Shows order summary with **Confirm** and **Cancel** buttons
7. **User:** Clicks **Confirm**
8. **Bot:** "✅ Order Created Successfully! Order ID: #456"

### Quick Order via Product List

1. **User:** `/products`
2. **Bot:** Shows products with "Order [Product]" buttons
3. **User:** Clicks **Order Paint X**
4. **Bot:** "How many units of product #123 do you want?"
5. **User:** `30`
6. **Bot:** Shows confirmation with buttons
7. Order placed! 🎉

---

## 🔔 Automatic Notifications

The bot automatically sends notifications for:

### Order Events
- **Order Created**: Notifies customer and all admins
- **Order Updated**: Notifies customer when status changes (Approved, Shipped, Delivered)

### Inventory Alerts
- **Low Stock**: Alerts admins when product quantity falls below threshold

### Dealer Events
- **New Registration**: Notifies admins of new dealer signup

---

## 🔧 Admin Features

### Dashboard Overview
```
/dashboard

📊 System Dashboard

📦 Total Orders: 156
⏳ Pending: 23
💰 Total Revenue: $45,678.90
📦 Products: 89
```

### Order Management
```
/orders

📦 Recent Orders:

#123 - PENDING
Total: $1,500
Dealer: 45

[Update #123] button
```

Clicking **Update** shows options:
- ✅ Approve
- 🚚 Ship
- ✔️ Deliver
- ❌ Cancel

### Broadcast Messages
```
/broadcast Important: Warehouse maintenance scheduled for tomorrow 10 AM - 2 PM

📢 Broadcasting message to all users...
✅ Message sent to 127 users.
```

---

## 🏗️ Architecture Integration

### Event-Driven Notifications

The bot integrates with your RabbitMQ event system:

```typescript
// Order Service publishes event
publishEvent('order.created', orderData);

// Notification Service consumes event
// → Sends Telegram notification automatically
```

### API Integration

All bot commands interact with your API Gateway:
- `/products` → `GET /api/inventory/products`
- `/order` → `POST /api/orders`
- `/dashboard` → `GET /api/orders`, `GET /api/inventory/products`
- `/analytics` → `POST /api/analytics/forecast`

---

## 🧪 Testing the Bot

### Local Testing

1. Start all services:
   ```bash
   docker-compose up
   ```

2. Open Telegram and find your bot
3. Send `/start` to begin

### Test Commands

```bash
# Buyer commands
/start
/products
/order
/myorders
/track 1

# Admin commands (requires your ID in TELEGRAM_ADMIN_IDS)
/dashboard
/orders
/inventory
/analytics
```

### Test Event Notifications

Create an order via API to trigger notification:
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "dealerId": 1,
    "items": [{"productId": 1, "quantity": 10, "unitPrice": 100, "taxPercentage": 10}],
    "shippingAddress": "123 Main St",
    "billingAddress": "123 Main St"
  }'
```

The bot should send a notification to the dealer and admins! 🎉

---

## 🔒 Security Notes

- **Admin Access**: Only users in `TELEGRAM_ADMIN_IDS` can use admin commands
- **Bot Token**: Keep `TELEGRAM_BOT_TOKEN` secret - never commit to git
- **User Mapping**: In production, map Telegram IDs to dealer/buyer accounts
- **Rate Limiting**: Telegram has rate limits (30 messages/second)

---

## 📊 Free vs Paid Comparison

| Feature | Telegram (FREE) | WhatsApp Business API (PAID) |
|---------|-----------------|------------------------------|
| Cost | $0 | $0.004-0.0075 per message |
| Two-way messaging | ✅ Yes | ✅ Yes |
| Inline buttons | ✅ Yes | ✅ Yes (limited) |
| File sharing | ✅ Up to 2GB | ✅ Up to 100MB |
| Group messaging | ✅ Yes | ✅ Yes |
| API rate limits | 30 msg/sec | Varies by plan |
| Setup complexity | Easy | Complex (requires Meta approval) |

**Verdict**: Telegram is perfect for your use case - it's free, powerful, and easy to set up! 🚀

---

## 🐛 Troubleshooting

### Bot not responding
- Check `TELEGRAM_BOT_TOKEN` is correct
- Verify bot is running: check logs for "Telegram bot started successfully"
- Try `/start` command to wake up the bot

### Admin commands not working
- Ensure your Telegram ID is in `TELEGRAM_ADMIN_IDS`
- Get your ID from @userinfobot
- Restart the service after updating `.env`

### Notifications not received
- Check RabbitMQ is running: `docker-compose ps`
- Verify event consumer is connected: check logs
- Test with manual order creation via API

### API calls failing
- Verify `API_GATEWAY_URL` is correct in `.env`
- Ensure all services are running
- Check API Gateway logs for errors

---

## 📚 Resources

- [Telegraf Documentation](https://telegraf.js.org/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [@BotFather](https://t.me/botfather) - Create and manage bots
- [@userinfobot](https://t.me/userinfobot) - Get your Telegram ID

---

## 🎯 Next Steps

1. ✅ Create your bot with @BotFather
2. ✅ Get your admin ID from @userinfobot
3. ✅ Configure `.env` with your tokens
4. ✅ Start the service
5. ✅ Test with `/start`
6. 🚀 Start receiving notifications!

**Happy coding!** 🎉
