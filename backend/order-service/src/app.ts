import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import orderRoutes from './routes/order.routes';
import { logger } from './utils/logger';
import { connectRabbitMQ } from './events/publisher';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/orders', orderRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

const start = async () => {
  await connectRabbitMQ();
  app.listen(PORT, () => {
    logger.info(`Order Service running on port ${PORT}`);
  });
};

start();

export default app;
