import { Telegraf, Context, Markup } from 'telegraf';
import axios from 'axios';
import { config } from '../config';

interface SessionData {
  step?: string;
  orderData?: any;
}

interface MyContext extends Context {
  session?: SessionData;
}

export class TelegramBotService {
  private bot: Telegraf<MyContext>;
  private sessions: Map<number, SessionData> = new Map();
  private apiGateway = config.apiGateway || 'http://localhost:3000';

  constructor(token: string) {
    this.bot = new Telegraf<MyContext>(token);
    this.setupMiddleware();
    this.setupCommands();
    this.setupCallbackHandlers();
  }

  private setupMiddleware() {
    // Session middleware
    this.bot.use((ctx, next) => {
      if (ctx.from) {
        if (!this.sessions.has(ctx.from.id)) {
          this.sessions.set(ctx.from.id, {});
        }
        ctx.session = this.sessions.get(ctx.from.id);
      }
      return next();
    });

    // Log all commands for debugging
    this.bot.use((ctx, next) => {
      if (ctx.message && 'text' in ctx.message) {
        console.log(`📨 Command from ${ctx.from?.id}: ${ctx.message.text}`);
      }
      return next();
    });
  }

  private setupCommands() {
    // Start command
    this.bot.command('start', async (ctx) => {
      const userId = ctx.from?.id;
      const username = ctx.from?.username || ctx.from?.first_name || 'User';

      await ctx.reply(
        `🎉 Welcome to the Supply Chain Management System, ${username}!\n\n` +
        `I can help you with:\n\n` +
        `📦 *Buyer Commands:*\n` +
        `/products - Browse available products\n` +
        `/order - Place a new order\n` +
        `/myorders - View your orders\n` +
        `/track <orderId> - Track an order\n\n` +
        `🔧 *Admin Commands:*\n` +
        `/dashboard - View system overview\n` +
        `/orders - Manage all orders\n` +
        `/inventory - Check inventory status\n` +
        `/analytics - View analytics & forecasts\n` +
        `/broadcast - Send message to all users\n\n` +
        `Type /help anytime for assistance!`,
        { parse_mode: 'Markdown' }
      );
    });

    // Help command
    this.bot.command('help', async (ctx) => {
      await ctx.reply(
        `🆘 *Help & Support*\n\n` +
        `Use the commands from /start to navigate.\n\n` +
        `Need assistance? Contact support at support@example.com`,
        { parse_mode: 'Markdown' }
      );
    });

    // Products command (Buyer)
    this.bot.command('products', async (ctx) => {
      try {
        await ctx.reply('🔍 Fetching products...');
        // Call inventory service directly with correct route
        const response = await axios.get('http://inventory-service:3002/api/inventory/products');
        const products = response.data.data || response.data; // Handle {success, data} format

        if (!products || products.length === 0) {
          await ctx.reply('No products available at the moment.');
          return;
        }

        let message = '📦 *Available Products:*\n\n';
        const buttons = [];

        for (const product of products.slice(0, 10)) {
          message += `*${product.name}*\n`;
          message += `SKU: ${product.sku}\n`;
          message += `Price: ₹${product.basePrice}\n`;
          message += `Brand: ${product.brand || 'N/A'}\n\n`;

          buttons.push([
            Markup.button.callback(
              `Order ${product.name}`,
              `order_${product.id}`
            )
          ]);
        }

        await ctx.reply(message, {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard(buttons)
        });
      } catch (error: any) {
        console.error('Error fetching products:', error.message);
        console.error('Error details:', error.response?.data || error);
        await ctx.reply('❌ Failed to fetch products. Please try again later.');
      }
    });

    // Order command (Buyer) - Conversational flow
    this.bot.command('order', async (ctx) => {
      const session = ctx.session!;
      session.step = 'select_product';
      session.orderData = {};

      await ctx.reply(
        '🛒 *New Order*\n\n' +
        'Let\'s create your order step by step.\n\n' +
        'First, please send me the *Product ID* you want to order.\n' +
        'Use /products to see available products.',
        { parse_mode: 'Markdown' }
      );
    });

    // My Orders command (Buyer)
    this.bot.command('myorders', async (ctx) => {
      await ctx.reply('📦 To view your orders, use:\n\n/track <orderId>\n\nYou will receive your order ID after placing an order.');
    });

    // Track command (Buyer)
    this.bot.command('track', async (ctx) => {
      const args = ctx.message.text.split(' ');
      if (args.length < 2) {
        await ctx.reply('Usage: /track <orderId>\nExample: /track 123');
        return;
      }

      const orderId = args[1];
      try {
        const response = await axios.get(`${this.apiGateway}/api/orders/${orderId}`);
        const order = response.data;

        await ctx.reply(
          `📦 *Order Tracking #${order.id}*\n\n` +
          `Status: *${order.status}*\n` +
          `Total: $${order.totalAmount}\n` +
          `Items: ${order.items?.length || 0}\n` +
          `Created: ${new Date(order.createdAt).toLocaleDateString()}\n` +
          `Updated: ${new Date(order.updatedAt).toLocaleDateString()}`,
          { parse_mode: 'Markdown' }
        );
      } catch (error: any) {
        await ctx.reply(`❌ Order #${orderId} not found.`);
      }
    });

    // Dashboard command (Admin)
    this.bot.command('dashboard', async (ctx) => {
      const userId = ctx.from?.id;
      console.log(`Dashboard requested by user ID: ${userId}`);
      console.log(`Admin IDs configured: ${config.telegram?.adminIds}`);
      
      if (!this.isAdmin(userId)) {
        await ctx.reply('⛔ Admin access required.');
        return;
      }

      try {
        await ctx.reply('📊 Loading dashboard...');

        // Fetch products data (orders endpoint doesn't support listing all)
        const productsRes = await axios.get('http://inventory-service:3002/api/inventory/products');
        const products = productsRes.data.data || productsRes.data;

        await ctx.reply(
          `📊 *System Dashboard*\n\n` +
          `📦 Products: ${products.length}\n` +
          `✅ All systems operational\n\n` +
          `Use /inventory or /analytics for details.`,
          { parse_mode: 'Markdown' }
        );
      } catch (error: any) {
        console.error('Dashboard error:', error.message);
        console.error('Error details:', error.response?.data || error);
        await ctx.reply('❌ Failed to load dashboard.');
      }
    });

    // Orders command (Admin)
    this.bot.command('orders', async (ctx) => {
      if (!this.isAdmin(ctx.from?.id)) {
        await ctx.reply('⛔ Admin access required.');
        return;
      }

      try {
        await ctx.reply('📋 Fetching recent orders...');
        const response = await axios.get('http://order-service:3003/api/orders?limit=10');
        const orders = response.data.data || response.data;

        if (!orders || orders.length === 0) {
          await ctx.reply('No orders found.');
          return;
        }

        let message = '📦 *Recent Orders:*\n\n';
        const buttons = [];

        for (const order of orders.slice(0, 10)) {
          message += `*${order.orderNumber}*\n`;
          message += `Status: ${order.status}\n`;
          message += `Total: ₹${order.totalAmount}\n`;
          message += `Date: ${new Date(order.createdAt).toLocaleDateString()}\n\n`;

          buttons.push([
            Markup.button.callback(`Track ${order.orderNumber}`, `track_${order.id}`)
          ]);
        }

        await ctx.reply(message, {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard(buttons)
        });
      } catch (error: any) {
        console.error('Orders error:', error.message);
        await ctx.reply('❌ Failed to fetch orders.');
      }
    });

    // Inventory command (Admin)
    this.bot.command('inventory', async (ctx) => {
      if (!this.isAdmin(ctx.from?.id)) {
        await ctx.reply('⛔ Admin access required.');
        return;
      }

      try {
        await ctx.reply('📦 Checking inventory...');
        const response = await axios.get('http://inventory-service:3002/api/inventory/warehouses');
        const warehouses = response.data.data || response.data;

        if (!warehouses || warehouses.length === 0) {
          await ctx.reply('No warehouses found.');
          return;
        }

        let message = '📦 *Warehouse Inventory:*\n\n';
        for (const warehouse of warehouses.slice(0, 10)) {
          message += `🏭 *${warehouse.name}*\n`;
          message += `Location: ${warehouse.location}\n`;
          message += `Capacity: ${warehouse.capacity}\n\n`;
        }

        await ctx.reply(message, { parse_mode: 'Markdown' });
      } catch (error: any) {
        await ctx.reply('❌ Failed to fetch inventory.');
      }
    });

    // Analytics command (Admin)
    this.bot.command('analytics', async (ctx) => {
      if (!this.isAdmin(ctx.from?.id)) {
        await ctx.reply('⛔ Admin access required.');
        return;
      }

      try {
        await ctx.reply('📊 Generating analytics...');
        const response = await axios.post(`${this.apiGateway}/api/analytics/forecast`, {
          productId: 1,
          warehouseId: 1,
          periods: 7
        });

        const forecast = response.data;
        let message = '📈 *Demand Forecast:*\n\n';
        
        if (forecast.predictions && forecast.predictions.length > 0) {
          for (const pred of forecast.predictions.slice(0, 7)) {
            message += `Day ${pred.period}: ${pred.predictedDemand} units\n`;
          }
        }

        await ctx.reply(message, { parse_mode: 'Markdown' });
      } catch (error: any) {
        await ctx.reply('❌ Failed to generate analytics.');
      }
    });

    // Broadcast command (Admin)
    this.bot.command('broadcast', async (ctx) => {
      if (!this.isAdmin(ctx.from?.id)) {
        await ctx.reply('⛔ Admin access required.');
        return;
      }

      const args = ctx.message.text.split(' ').slice(1).join(' ');
      if (!args) {
        await ctx.reply('Usage: /broadcast <message>');
        return;
      }

      await ctx.reply('📢 Broadcasting message to all users...');
      
      let sent = 0;
      for (const [userId] of this.sessions) {
        try {
          await this.bot.telegram.sendMessage(userId, `📢 *Broadcast:*\n\n${args}`, { parse_mode: 'Markdown' });
          sent++;
        } catch (error) {
          // User may have blocked the bot
        }
      }

      await ctx.reply(`✅ Message sent to ${sent} users.`);
    });

    // Handle conversational order flow
    this.bot.on('text', async (ctx) => {
      const session = ctx.session!;

      if (session.step === 'select_product') {
        session.orderData.productId = ctx.message.text;
        session.step = 'enter_quantity';
        await ctx.reply('How many units do you want to order?');
      } else if (session.step === 'enter_quantity') {
        session.orderData.quantity = parseInt(ctx.message.text);
        session.step = 'confirm_order';
        
        await ctx.reply(
          `📝 *Order Summary:*\n\n` +
          `Product ID: ${session.orderData.productId}\n` +
          `Quantity: ${session.orderData.quantity}\n\n` +
          `Confirm this order?`,
          {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
              [
                Markup.button.callback('✅ Confirm', 'confirm_order'),
                Markup.button.callback('❌ Cancel', 'cancel_order')
              ]
            ])
          }
        );
      }
    });
  }

  private setupCallbackHandlers() {
    // Handle product order buttons
    this.bot.action(/^order_(.+)$/, async (ctx) => {
      const productId = ctx.match[1];
      const session = ctx.session!;
      
      session.orderData = { productId };
      session.step = 'enter_quantity';

      await ctx.answerCbQuery();
      await ctx.reply(`How many units of product #${productId} do you want?`);
    });

    // Handle order confirmation
    this.bot.action('confirm_order', async (ctx) => {
      const session = ctx.session!;
      
      try {
        await ctx.answerCbQuery('Creating order...');
        
        // Create order via API Gateway
        const orderData = {
          dealerId: ctx.from?.id || 1, // Use Telegram ID as dealer ID (in production, map to actual dealer)
          items: [
            {
              productId: parseInt(session.orderData.productId),
              quantity: session.orderData.quantity,
              unitPrice: 100, // In production, fetch from product
              taxPercentage: 10
            }
          ],
          shippingAddress: 'Telegram Order',
          billingAddress: 'Telegram Order'
        };

        const response = await axios.post(`${this.apiGateway}/api/orders`, orderData);
        const order = response.data;

        await ctx.editMessageText(
          `✅ *Order Created Successfully!*\n\n` +
          `Order ID: #${order.id}\n` +
          `Status: ${order.status}\n` +
          `Total: $${order.totalAmount}\n\n` +
          `Track with: /track ${order.id}`,
          { parse_mode: 'Markdown' }
        );

        // Clear session
        session.step = undefined;
        session.orderData = undefined;
      } catch (error: any) {
        console.error('Order creation error:', error.message);
        await ctx.editMessageText('❌ Failed to create order. Please try again.');
      }
    });

    // Handle order cancellation
    this.bot.action('cancel_order', async (ctx) => {
      const session = ctx.session!;
      session.step = undefined;
      session.orderData = undefined;

      await ctx.answerCbQuery('Order cancelled');
      await ctx.editMessageText('❌ Order cancelled.');
    });

    // Handle order update buttons
    this.bot.action(/^update_(.+)$/, async (ctx) => {
      const orderId = ctx.match[1];
      
      await ctx.answerCbQuery();
      await ctx.reply(
        `Update order #${orderId}:`,
        Markup.inlineKeyboard([
          [Markup.button.callback('✅ Approve', `approve_${orderId}`)],
          [Markup.button.callback('🚚 Ship', `ship_${orderId}`)],
          [Markup.button.callback('✔️ Deliver', `deliver_${orderId}`)],
          [Markup.button.callback('❌ Cancel', `cancel_order_${orderId}`)]
        ])
      );
    });

    // Handle order status updates
    this.bot.action(/^(approve|ship|deliver|cancel_order)_(.+)$/, async (ctx) => {
      const action = ctx.match[1];
      const orderId = ctx.match[2];

      const statusMap: any = {
        approve: 'APPROVED',
        ship: 'SHIPPED',
        deliver: 'DELIVERED',
        cancel_order: 'CANCELLED'
      };

      try {
        await axios.patch(`${this.apiGateway}/api/orders/${orderId}`, {
          status: statusMap[action]
        });

        await ctx.answerCbQuery('✅ Order updated');
        await ctx.editMessageText(`✅ Order #${orderId} updated to ${statusMap[action]}`);
      } catch (error: any) {
        await ctx.answerCbQuery('❌ Update failed');
      }
    });
  }

  private isAdmin(userId?: number): boolean {
    if (!userId) return false;
    const adminIds = config.telegram?.adminIds || [];
    return adminIds.includes(userId);
  }

  // Public method to send notifications (called by event consumer)
  public async sendNotification(userId: number, message: string, options?: any) {
    try {
      await this.bot.telegram.sendMessage(userId, message, {
        parse_mode: 'Markdown',
        ...options
      });
    } catch (error: any) {
      console.error(`Failed to send notification to ${userId}:`, error.message);
    }
  }

  // Notify on order events
  public async notifyOrderCreated(order: any) {
    const message = 
      `🎉 *New Order Created!*\n\n` +
      `Order ID: #${order.id}\n` +
      `Status: ${order.status}\n` +
      `Total: $${order.totalAmount}\n` +
      `Items: ${order.items?.length || 0}\n\n` +
      `Track: /track ${order.id}`;

    // Notify customer (in production, map order.dealerId to Telegram ID)
    if (order.dealerId) {
      await this.sendNotification(order.dealerId, message);
    }

    // Notify all admins
    const adminIds = config.telegram?.adminIds || [];
    for (const adminId of adminIds) {
      await this.sendNotification(adminId, message);
    }
  }

  public async notifyOrderUpdated(order: any) {
    const message = 
      `📦 *Order Updated!*\n\n` +
      `Order ID: #${order.id}\n` +
      `New Status: *${order.status}*\n` +
      `Total: $${order.totalAmount}`;

    if (order.dealerId) {
      await this.sendNotification(order.dealerId, message);
    }
  }

  public async notifyLowStock(product: any, quantity: number) {
    const message = 
      `⚠️ *Low Stock Alert!*\n\n` +
      `Product: ${product.name || product.id}\n` +
      `Current Stock: ${quantity} units\n` +
      `Action required!`;

    const adminIds = config.telegram?.adminIds || [];
    for (const adminId of adminIds) {
      await this.sendNotification(adminId, message);
    }
  }

  public async start() {
    try {
      // Test the bot connection first
      const botInfo = await this.bot.telegram.getMe();
      console.log(`✅ Bot connected: @${botInfo.username}`);
      
      // Enable graceful stop  
      process.once('SIGINT', () => this.stop());
      process.once('SIGTERM', () => this.stop());
      
      // Delete any existing webhook and start polling
      await this.bot.telegram.deleteWebhook({ drop_pending_updates: true });
      
      // Launch bot async - don't wait for it
      this.bot.launch({
        dropPendingUpdates: true,
        allowedUpdates: ['message', 'callback_query']
      }).then(() => {
        console.log('✅ Telegram bot launched successfully');
      }).catch((err) => {
        console.error('⚠️  Bot launch error:', err.message);
        console.log('💡 Bot API is connected and can send notifications');
      });
      
      console.log('✅ Telegram bot initialization complete');
    } catch (error: any) {
      console.error('❌ Failed to connect Telegram bot:', error.message);
      // Don't throw - let service continue without bot
    }
  }

  public stop() {
    this.bot.stop('SIGINT');
    console.log('🛑 Telegram bot stopped');
  }
}
