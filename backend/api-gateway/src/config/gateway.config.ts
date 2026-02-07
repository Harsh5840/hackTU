import dotenv from 'dotenv';
dotenv.config();

export const SERVICES = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    routes: ['/api/auth']
  },
  inventory: {
    url: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3002',
    routes: ['/api/inventory']
  },
  order: {
    url: process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
    routes: ['/api/orders']
  },
  dealer: {
    url: process.env.DEALER_SERVICE_URL || 'http://localhost:3004',
    routes: ['/api/dealers']
  },
  analytics: {
    url: process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:8000',
    routes: ['/api/analytics']
  },
  forecast: {
    url: process.env.FORECAST_SERVICE_URL || 'http://localhost:5000',
    routes: ['/api/forecast']
  },
  notification: {
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006',
    routes: ['/api/notifications']
  },
  location: { // Placeholder if needed
    url: process.env.LOCATION_SERVICE_URL || 'http://localhost:3007',
    routes: ['/api/locations']
  }
};
