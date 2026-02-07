import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';

const router = Router();

// Product routes
router.get('/products', inventoryController.getProducts);
router.get('/products/:id', inventoryController.getProduct);
router.post('/products', inventoryController.createProduct);
router.put('/products/:id', inventoryController.updateProduct);
router.delete('/products/:id', inventoryController.deleteProduct);

// Category routes
router.get('/categories', inventoryController.getCategories);

// Warehouse routes
router.get('/warehouses', inventoryController.getWarehouses);
router.get('/warehouses/:warehouseId', inventoryController.getWarehouseInventory);

// Stock management
router.post('/adjust', inventoryController.adjustStock);

export default router;
