import prisma from '../config/database';
import { TransactionType, Prisma } from '@prisma/client';
import { calculateStockStatus } from '../utils/stockCalculations';
import { publishEvent } from '../events/publisher';
import { logger } from '../utils/logger';

export const getInventoryByWarehouse = async (warehouseId: string) => {
  return prisma.inventory.findMany({
    where: { warehouseId },
    include: { product: true }
  });
};

export const getAllProducts = async () => {
  return prisma.product.findMany();
};

export const getAllWarehouses = async () => {
  return prisma.warehouse.findMany();
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
    const transactionData: Prisma.InventoryTransactionUncheckedCreateInput = {
        productId,
        warehouseId,
        transactionType: TransactionType.ADJUSTMENT,
        quantityBefore: currentQty,
        quantityChange: Number(quantityChange),
        quantityAfter: newQty,
        performedById: userId,
        notes: reason,
    };

    await tx.inventoryTransaction.create({
      data: transactionData
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

export const getProductById = async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true }
  });
};

export const createProduct = async (data: any) => {
  const productData: Prisma.ProductCreateInput = {
    sku: data.sku,
    name: data.name,
    description: data.description,
    category: { connect: { id: Number(data.categoryId) } },
    brand: data.brand || 'Modern Colours',
    colorCode: data.colorCode,
    colorName: data.colorName,
    finishType: data.finishType || 'MATTE',
    containerSize: Number(data.containerSize),
    containerType: data.containerType,
    unitOfMeasure: data.unitOfMeasure,
    basePrice: Number(data.basePrice),
    mrp: Number(data.mrp),
    reorderLevel: Number(data.reorderLevel) || 10,
    reorderQuantity: Number(data.reorderQuantity) || 50,
    leadTimeDays: Number(data.leadTimeDays) || 7,
    isFastMoving: data.isFastMoving || false,
    isSeasonal: data.isSeasonal || false,
    season: data.season,
    isActive: data.isActive !== false,
    imageUrls: data.imageUrls || []
  };

  const product = await prisma.product.create({ data: productData });
  publishEvent('product.created', { productId: product.id });
  return product;
};

export const updateProduct = async (id: string, data: any) => {
  const updateData: Prisma.ProductUpdateInput = {};
  
  if (data.sku) updateData.sku = data.sku;
  if (data.name) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.categoryId) updateData.category = { connect: { id: Number(data.categoryId) } };
  if (data.brand) updateData.brand = data.brand;
  if (data.colorCode !== undefined) updateData.colorCode = data.colorCode;
  if (data.colorName !== undefined) updateData.colorName = data.colorName;
  if (data.finishType) updateData.finishType = data.finishType;
  if (data.containerSize !== undefined) updateData.containerSize = Number(data.containerSize);
  if (data.containerType) updateData.containerType = data.containerType;
  if (data.unitOfMeasure) updateData.unitOfMeasure = data.unitOfMeasure;
  if (data.basePrice !== undefined) updateData.basePrice = Number(data.basePrice);
  if (data.mrp !== undefined) updateData.mrp = Number(data.mrp);
  if (data.reorderLevel !== undefined) updateData.reorderLevel = Number(data.reorderLevel);
  if (data.reorderQuantity !== undefined) updateData.reorderQuantity = Number(data.reorderQuantity);
  if (data.leadTimeDays !== undefined) updateData.leadTimeDays = Number(data.leadTimeDays);
  if (data.isFastMoving !== undefined) updateData.isFastMoving = Boolean(data.isFastMoving);
  if (data.isSeasonal !== undefined) updateData.isSeasonal = Boolean(data.isSeasonal);
  if (data.season !== undefined) updateData.season = data.season;
  if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);
  if (data.imageUrls) updateData.imageUrls = data.imageUrls;

  const product = await prisma.product.update({
    where: { id },
    data: updateData
  });

  publishEvent('product.updated', { productId: product.id });
  return product;
};

export const deleteProduct = async (id: string) => {
  // Soft delete by setting isActive to false
  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false }
  });

  publishEvent('product.deleted', { productId: product.id });
  return product;
};

export const getAllCategories = async () => {
  return prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
};
