import amqp from 'amqplib';
import { logger } from '../utils/logger';
import { sendEmail } from '../channels/email.channel';

export const connectConsumer = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    const channel = await connection.createChannel();
    
    // Exchange
    await channel.assertExchange('supply_chain.orders', 'topic', { durable: true });
    await channel.assertExchange('supply_chain.dealers', 'topic', { durable: true });
    await channel.assertExchange('supply_chain.inventory', 'topic', { durable: true });

    // Queue
    const q = await channel.assertQueue('notification_queue', { durable: true });
    
    // Bindings
    channel.bindQueue(q.queue, 'supply_chain.orders', 'order.*');
    channel.bindQueue(q.queue, 'supply_chain.dealers', 'dealer.*');
    channel.bindQueue(q.queue, 'supply_chain.inventory', 'inventory.stock.low');

    logger.info('Notification Service Waiting for messages...');

    channel.consume(q.queue, async (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        const { eventType, data } = content;
        
        logger.info(`Received event: ${eventType}`);

        // Handle Event Logic
        switch (eventType) {
          case 'dealer.registered':
            if (data.email) {
              await sendEmail(data.email, 'Welcome to Modern Colours', `Dear ${data.businessName}, your registration is pending review.`);
            }
            break;
          case 'dealer.approved':
            if (data.email) {
              await sendEmail(data.email, 'Registration Approved', `Your dealer account is now active.`);
            }
            break;
          case 'order.created':
            // Notify Admin or Dealer
            logger.info(`Order Created: ${data.orderId}`);
            break;
          case 'inventory.stock.low':
            logger.warn(`Low Stock Alert: ${data.productId} at ${data.warehouseId}`);
            await sendEmail(
              process.env.ADMIN_EMAIL || 'admin@moderncolours.com',
              `Low Stock Alert: Product ${data.productId}`,
              `Warehouse: ${data.warehouseId}\nCurrent Quantity: ${data.currentQty}\nPlease restock immediately.`
            );
            break;
        }

        channel.ack(msg);
      }
    });

  } catch (error) {
    logger.error('RabbitMQ Consumer Connection Error', error);
  }
};
