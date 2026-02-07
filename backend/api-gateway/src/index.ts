import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

import { SERVICES } from './config/gateway.config';
import { requestLogger } from './middleware/logger.middleware';
import { authenticate } from './middleware/auth.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';
import { logger } from './utils/logger';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Security & Optimization
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(compression());
// app.use(express.json({ limit: '10mb' })); // Commenting out to avoid conflict with http-proxy-middleware

// Logging
app.use(morgan('dev'));
app.use(requestLogger);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Authentication Middleware - DISABLED for demo
// app.use('/api', (req, res, next) => {
//   if (req.url.startsWith('/auth')) {
//     return next();
//   }
//   authenticate(req, res, next);
// });

// Proxy Routes
Object.entries(SERVICES).forEach(([name, service]) => {
  service.routes.forEach(route => {
    app.use(route, createProxyMiddleware({
      target: service.url,
      changeOrigin: true,
      pathRewrite: (path) => {
        // Special handling for analytics service - rewrite path
        if (name === 'analytics') {
          return path.replace('/api/analytics', '/api/v1');
        }
        return path;
      },
      onProxyReq: (proxyReq: any, req: any, res: any) => {
           // Pass User ID if authenticated
           if ((req as any).user) {
             proxyReq.setHeader('X-User-Id', (req as any).user.id);
             proxyReq.setHeader('X-User-Role', (req as any).user.role);
           }
      }
    }));
    logger.info(`Mapped ${route} -> ${service.url}`);
  });
});

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});

export default app;
