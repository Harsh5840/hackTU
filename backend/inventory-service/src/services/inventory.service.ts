import prisma from '../config/database';
import { calculateStockStatus } from '../utils/stockCalculations';
import { publishEvent } from '../events/publisher';
import { logger } from '../utils/logger';

export const getInventoryByWarehouse = async (warehouseId: string) => {
  return prisma.inventory.findMany({
    where: { warehouseId },
    include: { product: true }
  });
};

export const adjustStock = async (data: any) => {
  const { productId, warehouseId, quantityChange, userId, reason } = data;
  
  // 1. Get current stock
  const inventory = await prisma.inventory.findUnique({
    where: { productId_warehouseId_batchNumber: { 
       productId, 
       warehouseId, 
       batchNumber: data.batchNumber || 'DEFAULT' 
    }}
  });

  const currentQty = inventory?.quantity || 0;
  const newQty = currentQty + quantityChange;

  if (newQty < 0) throw new Error('Insufficient stock');

  // 2. Transact
  const updated = await prisma.$transaction(async (tx) => {
    // Record Transaction
    await tx.inventoryTransaction.create({
      data: {
        productId,
        warehouseId,
        transactionType: 'ADJUSTMENT',
        quantityBefore: currentQty,
        quantityChange,
        quantityAfter: newQty,
        performedById: userId,
        notes: reason
      }
    });

    // Update Stock
    return tx.inventory.upsert({
      where: { 
         productId_warehouseId_batchNumber: { 
           productId, 
           warehouseId, 
           batchNumber: data.batchNumber || 'DEFAULT' 
        }
      },
      update: { quantity: newQty },
      create: {
        productId,
        warehouseId,
        quantity: newQty,
        batchNumber: data.batchNumber || 'DEFAULT'
      }
    });
  });

  // 3. Alerts & Events
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (product) {
    const status = calculateStockStatus(updated.quantity, product.reorderLevel);
    if (status === 'LOW' || status === 'CRITICAL') {
      publishEvent('inventory.stock.low', { productId, warehouseId, currentQty: updated.quantity });
    }
  }

  publishEvent('inventory.stock.adjusted', { productId, warehouseId, change: quantityChange });
  
  return updated;
};
