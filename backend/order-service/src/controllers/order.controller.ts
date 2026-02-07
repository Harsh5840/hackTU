import { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { logger } from '../utils/logger';

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
