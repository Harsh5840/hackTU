import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';

const router = Router();

router.get('/warehouses/:warehouseId', inventoryController.getWarehouseInventory);
router.post('/adjust', inventoryController.adjustStock);

export default router;
