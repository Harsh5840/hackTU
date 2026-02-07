import amqp from 'amqplib';
import { logger } from '../utils/logger';
import crypto from 'crypto';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertExchange('supply_chain.dealers', 'topic', { durable: true });
    logger.info('Connected to RabbitMQ (Dealer Service)');
  } catch (error) {
    logger.error('RabbitMQ connection error', error);
  }
};

export const publishEvent = (routingKey: string, dealerId: string, data: any, actor?: { userId: string, role: string }) => {
  if (!channel) {
    logger.warn('RabbitMQ channel not ready for Dealer Service');
    return;
  }
  
  const payload = JSON.stringify({
    eventId: crypto.randomUUID(),
    eventType: routingKey,
    timestamp: new Date().toISOString(),
    source: 'dealer-service',
    actor: actor || { userId: 'system', role: 'SYSTEM' },
    data: {
      dealerId,
      ...data
    }
  });
  
  channel.publish('supply_chain.dealers', routingKey, Buffer.from(payload));
  logger.debug(`[Dealer Service] Event published: ${routingKey}`, { dealerId });
};
