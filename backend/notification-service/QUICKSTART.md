# 🚀 Quick Start: Telegram Bot

## ⚡ Get Started in 3 Minutes

### 1️⃣ Create Your Bot (2 minutes)

1. Open Telegram → Search **@BotFather**
2. Send: `/newbot`
3. Name: `Your Business Bot`
4. Username: `YourBusinessBot`
5. **Copy the token** (like: `123456789:ABC...`)

### 2️⃣ Get Your Admin ID (30 seconds)

1. Search **@userinfobot**
2. Send: `/start`
3. **Copy your ID** (like: `123456789`)

### 3️⃣ Configure & Start (30 seconds)

```bash
cd backend/notification-service

# Create .env file
cp .env.example .env

# Edit .env and add:
# TELEGRAM_BOT_TOKEN=your_token_here
# TELEGRAM_ADMIN_IDS=your_id_here

# Start the service
npm run dev
```

### 4️⃣ Test It!

Open your bot in Telegram and send:
```
/start
```

**That's it!** 🎉

---

## 🎯 What You Can Do

### As a Buyer/Dealer:
- `/products` - Browse and order
- `/order` - Place order via chat
- `/myorders` - View your orders
- `/track 123` - Track order #123

### As an Admin:
- `/dashboard` - System overview
- `/orders` - Manage all orders
- `/inventory` - Stock levels
- `/analytics` - Forecasts
- `/broadcast` - Message all users

---

## 🔔 Automatic Notifications

You'll get instant notifications for:
- ✅ New orders created
- 📦 Order status updates
- ⚠️ Low stock alerts
- 🆕 New dealer registrations

All **100% FREE** with no message limits! 🚀

---

## 📝 Full Documentation

See [TELEGRAM_BOT_SETUP.md](./TELEGRAM_BOT_SETUP.md) for:
- Detailed setup guide
- All commands and features
- Troubleshooting tips
- Architecture details
