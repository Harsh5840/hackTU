import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import dealerRoutes from './routes/dealerRoutes';
import { logger } from './utils/logger';
import { connectRabbitMQ } from './events/publisher';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/dealers', dealerRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

const start = async () => {
  try {
    await connectRabbitMQ();
    app.listen(PORT, () => {
      logger.info(`Dealer Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start Dealer Service', { error });
    process.exit(1);
  }
};

start();

export default app;
