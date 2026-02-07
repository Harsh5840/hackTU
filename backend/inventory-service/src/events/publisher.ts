import amqp from 'amqplib';
import crypto from 'crypto';
import { logger } from '../utils/logger';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertExchange('supply_chain.inventory', 'topic', { durable: true });
    logger.info('Connected to RabbitMQ');
  } catch (error) {
    logger.error('RabbitMQ connection error', error);
  }
};

export const publishEvent = (routingKey: string, data: any) => {
  if (!channel) {
    logger.warn('RabbitMQ channel not ready');
    return;
  }
  
  const payload = JSON.stringify({
    eventId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    source: 'inventory-service',
    data
  });
  
  channel.publish('supply_chain.inventory', routingKey, Buffer.from(payload));
  logger.debug(`Event published: ${routingKey}`);
};
