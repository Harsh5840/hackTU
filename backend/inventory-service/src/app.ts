import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import inventoryRoutes from './routes/inventory.routes';
import { logger } from './utils/logger';
import { connectRabbitMQ } from './events/publisher';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/inventory', inventoryRoutes);

// Socket.io
io.of('/inventory').on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  
  socket.on('join_warehouse', (warehouseId) => {
    socket.join(`warehouse:${warehouseId}`);
  });
});

// Start
const start = async () => {
  await connectRabbitMQ();
  
  httpServer.listen(PORT, () => {
    logger.info(`Inventory Service running on port ${PORT}`);
  });
};

start();

export default app;
