import { PrismaClient, WarehouseType, FinishType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Create Warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { code: 'WH-001' },
    update: {},
    create: {
      name: 'Main Request Warehouse',
      code: 'WH-001',
      type: WarehouseType.WAREHOUSE,
      totalCapacity: 10000,
      currentUtilization: 0,
    },
  });
  console.log(`Created warehouse: ${warehouse.name}`);

  // Create Category
  const category = await prisma.category.upsert({
    where: { name: 'Interior Paints' },
    update: {},
    create: {
      name: 'Interior Paints',
      slug: 'interior-paints',
      description: 'Premium interior wall paints',
    },
  });
  console.log(`Created category: ${category.name}`);

  // Create Product
  const product = await prisma.product.upsert({
    where: { sku: 'P-100' },
    update: {},
    create: {
      sku: 'P-100',
      name: 'Ultra White Satin',
      description: 'High durability satin finish paint',
      categoryId: category.id,
      brand: 'Modern Colours',
      finishType: FinishType.SEMI_GLOSSY, // Correct enum value
      basePrice: 1200,
      mrp: 1500,
      containerSize: 4,
      containerType: 'Bucket',
      unitOfMeasure: 'L',
      reorderLevel: 20,
      reorderQuantity: 50,
    },
  });
  console.log(`Created product: ${product.name}`);

  // Create Initial Inventory
  const inventory = await prisma.inventory.upsert({
    where: {
      productId_warehouseId_batchNumber: {
        productId: product.id,
        warehouseId: warehouse.id,
        batchNumber: 'INITIAL_BATCH',
      },
    },
    update: {},
    create: {
      productId: product.id,
      warehouseId: warehouse.id,
      quantity: 100, // Initial stock
      batchNumber: 'INITIAL_BATCH',
      status: 'AVAILABLE',
    },
  });
  console.log(`Created inventory with ${inventory.quantity} units`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
