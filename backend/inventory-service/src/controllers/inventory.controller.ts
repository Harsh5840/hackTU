import { Request, Response } from 'express';
import * as inventoryService from '../services/inventory.service';
import { logger } from '../utils/logger';

export const getWarehouseInventory = async (req: Request, res: Response) => {
  try {
    const data = await inventoryService.getInventoryByWarehouse(req.params.warehouseId);
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const data = await inventoryService.getAllProducts();
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getWarehouses = async (req: Request, res: Response) => {
  try {
    const data = await inventoryService.getAllWarehouses();
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const adjustStock = async (req: Request, res: Response) => {
  try {
    const result = await inventoryService.adjustStock(req.body);
    res.json({ success: true, message: 'Stock adjusted', data: result });
  } catch (err: any) {
    logger.error(err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};
