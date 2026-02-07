import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3005,
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost',
  apiGateway: process.env.API_GATEWAY_URL || 'http://localhost:3000',
  email: {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || 'user',
    pass: process.env.SMTP_PASS || 'pass',
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    adminIds: process.env.TELEGRAM_ADMIN_IDS 
      ? process.env.TELEGRAM_ADMIN_IDS.split(',').map(id => parseInt(id.trim()))
      : []
  }
};
