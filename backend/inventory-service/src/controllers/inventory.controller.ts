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

export const getProduct = async (req: Request, res: Response) => {
  try {
    const data = await inventoryService.getProductById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const data = await inventoryService.createProduct(req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    logger.error(err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const data = await inventoryService.updateProduct(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error(err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await inventoryService.deleteProduct(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    logger.error(err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const data = await inventoryService.getAllCategories();
    res.json({ success: true, data });
  } catch (err: any) {
    logger.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
