import prisma from '../config/database';
import { calculateOrderTotals } from '../utils/orderCalculations';
import { publishEvent } from '../events/publisher';
import { logger } from '../utils/logger';
import { OrderStatus } from '@prisma/client';

export const createOrder = async (data: any) => {
  const { dealerId, items, deliveryAddress } = data;
  
  // 1. Calculate Totals
  const { subtotal, taxAmount, totalAmount, items: processedItems } = calculateOrderTotals(items);

  // 2. Create Order & Items
  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      dealerId,
      subtotal,
      taxAmount,
      totalAmount,
      deliveryAddress,
      items: {
        create: processedItems.map((item: any) => ({
          productId: item.productId,
          productName: item.productName || 'Unknown Product',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal
        }))
      }
    },
    include: { items: true }
  });

  // 3. Publish Event (to reserve stock)
  publishEvent('order.created', { 
    orderId: order.id, 
    items: processedItems.map((i: any) => ({ productId: i.productId, quantity: i.quantity })) 
  });

  logger.info(`Order created: ${order.orderNumber}`);
  return order;
};

export const getOrderById = async (id: string) => {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, payments: true }
  });
};

export const getAllOrders = async (filters?: { dealerId?: string; status?: OrderStatus; limit?: number }) => {
  const { dealerId, status, limit = 50 } = filters || {};
  
  return prisma.order.findMany({
    where: {
      ...(dealerId && { dealerId }),
      ...(status && { orderStatus: status })
    },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
};

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
  const order = await prisma.order.update({
    where: { id },
    data: { 
      orderStatus: status,
      updatedAt: new Date()
    },
    include: { items: true }
  });

  // Publish status change event
  publishEvent('order.status.updated', { 
    orderId: order.id, 
    orderNumber: order.orderNumber,
    status,
    previousStatus: order.orderStatus
  });

  logger.info(`Order ${order.orderNumber} status updated to ${status}`);
  return order;
};
