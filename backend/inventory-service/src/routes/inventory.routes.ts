import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';

const router = Router();

router.get('/warehouses/:warehouseId', inventoryController.getWarehouseInventory);
router.get('/products', inventoryController.getProducts);
router.get('/warehouses', inventoryController.getWarehouses);
router.post('/adjust', inventoryController.adjustStock);

export default router;
