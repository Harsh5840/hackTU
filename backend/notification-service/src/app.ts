import express from 'express';
import dotenv from 'dotenv';
import { connectConsumer } from './consumers/event.consumer';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const start = async () => {
  try {
    await connectConsumer();
    app.listen(PORT, () => {
      logger.info(`Notification Service running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start Notification service', err);
  }
};

start();
