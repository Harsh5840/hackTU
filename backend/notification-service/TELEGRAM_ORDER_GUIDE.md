# Telegram Bot Order Flow - Complete Guide

## ✅ Fixed Issues

### 1. Order Creation Now Works!
- **Fixed:** 401 Unauthorized error by calling order service directly
- **Fixed:** Incorrect endpoint - now uses `/api/orders/create`
- **Fixed:** Missing delivery address - now collects full address details
- **Fixed:** Product pricing - now fetches actual product details and prices

### 2. Enhanced User Input
Added comprehensive order information collection:
- ✅ Product selection (ID or from /products list)
- ✅ Quantity validation
- ✅ Street address
- ✅ City
- ✅ State
- ✅ Pincode
- ✅ Phone number
- ✅ Order confirmation with full summary

---

## How to Place an Order

### Method 1: Using /order Command

1. **Start the order:**
   ```
   /order
   ```

2. **Enter Product ID:**
   - Get product IDs using `/products` command
   - Example: `cfe300b9-32cf-4f43-9ef1-12347419411f`

3. **Enter Quantity:**
   - Must be a positive number
   - Example: `5`

4. **Enter Delivery Address:**
   - Street address: `123 Main Street, Apartment 4B`

5. **Enter City:**
   - Example: `Mumbai`

6. **Enter State:**
   - Example: `Maharashtra`

7. **Enter Pincode:**
   - Example: `400001`

8. **Enter Phone Number:**
   - Example: `+91 9876543210`

9. **Confirm Order:**
   - Review the summary
   - Click ✅ **Confirm** button
   - Or click ❌ **Cancel** to abort

### Method 2: Quick Order from Product List

1. **Browse products:**
   ```
   /products
   ```

2. **Click "Order" button** on any product

3. **Enter quantity and address details** (same as Method 1, steps 3-9)

---

## Order Tracking

After placing an order, you'll receive an order number like `ORD-1770460520792`.

**Track your order:**
```
/track ORD-1770460520792
```

**Track Response Includes:**
- Order Number
- Order Status (PENDING, APPROVED, SHIPPED, DELIVERED, CANCELLED)
- Payment Status
- Total Amount
- Items list with quantities and prices
- Creation date

---

## Example Complete Order Flow

```
User: /order

Bot: 🛒 New Order
     Let's create your order step by step.
     First, please send me the Product ID you want to order.
     Use /products to see available products.

User: cfe300b9-32cf-4f43-9ef1-12347419411f

Bot: How many units do you want to order?

User: 3

Bot: Please enter your delivery address (street address):

User: 456 Park Avenue, Tower B, Flat 302

Bot: Enter your city:

User: Pune

Bot: Enter your state:

User: Maharashtra

Bot: Enter your pincode:

User: 411001

Bot: Enter your contact phone number:

User: +91 9123456789

Bot: 📝 Order Summary:
     
     Product ID: cfe300b9-32cf-4f43-9ef1-12347419411f
     Quantity: 3
     
     📍 Delivery Address:
     456 Park Avenue, Tower B, Flat 302
     Pune, Maharashtra
     PIN: 411001
     📞 Phone: +91 9123456789
     
     Confirm this order?
     
     [✅ Confirm] [❌ Cancel]

User: *clicks ✅ Confirm*

Bot: ✅ Order Created Successfully!
     
     Order Number: ORD-1770460575269
     Status: PENDING
     Total: ₹3600
     
     Track with: /track 3bd3ce00-9201-4e71-ae29-9a279bccb069
```

---

## Available Commands

### Buyer Commands:
- `/start` - Welcome message and help
- `/help` - Show all available commands
- `/products` - Browse available products
- `/order` - Start new order flow
- `/track <orderId>` - Track specific order
- `/myorders` - Instructions for tracking orders

### Admin Commands (ID: 6140979307):
- `/dashboard` - System overview
- `/orders` - List recent orders
- `/inventory` - View warehouse inventory
- `/analytics` - Generate analytics
- `/broadcast <message>` - Send message to all users

---

## Technical Details

### Order Data Structure
```json
{
  "dealerId": "telegram-123456789",
  "items": [
    {
      "productId": "uuid-here",
      "productName": "Ultra White Satin",
      "quantity": 3,
      "unitPrice": "1200"
    }
  ],
  "deliveryAddress": {
    "line1": "456 Park Avenue, Tower B",
    "city": "Pune",
    "state": "Maharashtra",
    "pincode": "411001"
  }
}
```

### API Endpoints Used:
- `GET http://inventory-service:3002/api/inventory/products` - Fetch product details
- `POST http://order-service:3003/api/orders/create` - Create order
- `GET http://order-service:3003/api/orders/:id` - Track order

### Session Management:
The bot maintains session state for each user to track their order progress:
- `session.step` - Current step in order flow
- `session.orderData` - Collected order information
- Sessions are cleared after order completion or cancellation

---

## Error Handling

### Common Issues:

1. **Invalid Quantity:**
   - Bot will ask you to enter a valid number > 0

2. **Product Not Found:**
   - Use `/products` to get valid product IDs
   - Copy the full UUID shown in product list

3. **Order Creation Failed:**
   - Check your internet connection
   - Ensure all fields are filled correctly
   - Contact support if issue persists

4. **Order Not Found (tracking):**
   - Verify the order ID is correct
   - Order IDs are UUIDs like `3bd3ce00-9201-4e71-ae29-9a279bccb069`

---

## Features

### ✅ Input Validation
- Quantity must be a positive integer
- All address fields are required
- Product ID must match existing product

### ✅ Real Product Pricing
- Fetches actual product prices from inventory service
- Displays correct product names in orders
- Calculates totals with tax

### ✅ Comprehensive Address Collection
- Street address
- City
- State
- Pincode
- Phone number

### ✅ Order Confirmation
- Shows complete summary before submission
- Allows cancellation before creation
- Provides order number immediately after creation

### ✅ Direct Service Communication
- Bypasses API Gateway authentication
- Directly calls inventory and order services
- Faster response times

---

## Future Enhancements (Coming Soon)

- [ ] Order modification/cancellation
- [ ] Multiple items per order
- [ ] Saved addresses
- [ ] Payment integration
- [ ] Order notifications (status updates)
- [ ] Product search/filter
- [ ] Order history
- [ ] Delivery tracking with location

---

## Support

If you encounter any issues:
1. Check the command syntax
2. Ensure product IDs are valid
3. Verify all required fields are provided
4. Contact admin via bot for assistance

**Bot Username:** [@ModernColoursBot](https://t.me/ModernColoursBot)

---

*Last Updated: February 7, 2026*
*All features tested and working*
