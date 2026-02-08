import { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { logger } from '../utils/logger';
import { OrderStatus } from '@prisma/client';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const result = await orderService.createOrder(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    logger.error(err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const result = await orderService.getOrderById(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: result });
  } catch (err: any) {
    logger.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { dealerId, status, limit } = req.query;
    const filters = {
      dealerId: dealerId as string | undefined,
      status: status as OrderStatus | undefined,
      limit: limit ? parseInt(limit as string) : undefined
    };
    const result = await orderService.getAllOrders(filters);
    res.json({ success: true, data: result });
  } catch (err: any) {
    logger.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    const result = await orderService.updateOrderStatus(req.params.id, status as OrderStatus);
    res.json({ success: true, data: result });
  } catch (err: any) {
    logger.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
