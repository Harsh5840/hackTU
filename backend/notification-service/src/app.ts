import express from 'express';
import dotenv from 'dotenv';
import { connectConsumer, setTelegramBotGetter } from './consumers/event.consumer';
import { logger } from './utils/logger';
import { TelegramBotService } from './services/telegram.service';
import { config } from './config';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Initialize Telegram bot
let telegramBot: TelegramBotService | null = null;
if (config.telegram.botToken) {
  telegramBot = new TelegramBotService(config.telegram.botToken);
  logger.info('Telegram bot initialized');
  
  // Set getter for consumer to access bot
  setTelegramBotGetter(() => telegramBot);
} else {
  logger.warn('Telegram bot token not configured - bot disabled');
}

// Export bot instance for consumers
export { telegramBot };

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const start = async () => {
  try {
    // Start Telegram bot (with detailed logging)
    if (telegramBot) {
      logger.info('Attempting to start Telegram bot...');
      telegramBot.start()
        .then(() => logger.info('✅ Telegram bot started successfully'))
        .catch((err) => {
          logger.error('❌ Telegram bot failed to start');
          logger.error('Error message:', err.message);
          logger.error('Error stack:', err.stack);
        });
    }
    
    // Connect to RabbitMQ consumer (non-blocking)
    connectConsumer().catch((err) => {
      logger.error('RabbitMQ consumer failed:', err.message);
    });
    
    // Start HTTP server regardless of bot/queue status
    app.listen(PORT, () => {
      logger.info(`Notification Service running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start Notification service', err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  if (telegramBot) {
    telegramBot.stop();
  }
  process.exit(0);
});

start();
