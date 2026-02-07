import { PrismaClient, WarehouseType, FinishType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Create Warehouses
  const warehouses = await Promise.all([
    prisma.warehouse.upsert({
      where: { code: 'WH-001' },
      update: {},
      create: {
        name: 'Main Request Warehouse',
        code: 'WH-001',
        type: WarehouseType.WAREHOUSE,
        addressLine1: 'Andheri East',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400069',
        totalCapacity: 10000,
        currentUtilization: 0,
      },
    }),
    prisma.warehouse.upsert({
      where: { code: 'WH-002' },
      update: {},
      create: {
        name: 'Delhi Distribution Center',
        code: 'WH-002',
        type: WarehouseType.DISTRIBUTION_CENTER,
        addressLine1: 'Okhla Industrial Area',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110020',
        totalCapacity: 15000,
        currentUtilization: 0,
      },
    }),
    prisma.warehouse.upsert({
      where: { code: 'WH-003' },
      update: {},
      create: {
        name: 'Bangalore Regional Hub',
        code: 'WH-003',
        type: WarehouseType.WAREHOUSE,
        addressLine1: 'Whitefield',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560066',
        totalCapacity: 8000,
        currentUtilization: 0,
      },
    }),
  ]);
  console.log(`Created ${warehouses.length} warehouses`);

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Interior Paints' },
      update: {},
      create: {
        name: 'Interior Paints',
        slug: 'interior-paints',
        description: 'Premium interior wall paints',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Exterior Paints' },
      update: {},
      create: {
        name: 'Exterior Paints',
        slug: 'exterior-paints',
        description: 'Weather-resistant exterior paints',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Wood Finishes' },
      update: {},
      create: {
        name: 'Wood Finishes',
        slug: 'wood-finishes',
        description: 'Varnishes and wood stains',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Primers' },
      update: {},
      create: {
        name: 'Primers',
        slug: 'primers',
        description: 'Surface preparation primers',
      },
    }),
  ]);
  console.log(`Created ${categories.length} categories`);

  // Create Products with variety
  const productsData = [
    {
      sku: 'P-100',
      name: 'Ultra White Satin',
      description: 'High durability satin finish paint',
      categoryId: categories[0].id,
      brand: 'Modern Colours',
      finishType: FinishType.SEMI_GLOSSY,
      basePrice: 1200,
      mrp: 1500,
      containerSize: 4,
      containerType: 'Bucket',
      unitOfMeasure: 'L',
      reorderLevel: 20,
      reorderQuantity: 50,
    },
    {
      sku: 'P-101',
      name: 'Royal Blue Matt',
      description: 'Premium matt finish interior paint',
      categoryId: categories[0].id,
      brand: 'Modern Colours',
      finishType: FinishType.MATTE,
      basePrice: 1100,
      mrp: 1400,
      containerSize: 4,
      containerType: 'Bucket',
      unitOfMeasure: 'L',
      reorderLevel: 15,
      reorderQuantity: 40,
    },
    {
      sku: 'P-102',
      name: 'Sunset Orange Emulsion',
      description: 'Vibrant orange interior paint',
      categoryId: categories[0].id,
      brand: 'Modern Colours',
      finishType: FinishType.SEMI_GLOSSY,
      basePrice: 1150,
      mrp: 1450,
      containerSize: 4,
      containerType: 'Bucket',
      unitOfMeasure: 'L',
      reorderLevel: 20,
      reorderQuantity: 50,
    },
    {
      sku: 'P-200',
      name: 'WeatherShield Exterior White',
      description: 'All-weather exterior paint',
      categoryId: categories[1].id,
      brand: 'Modern Colours',
      finishType: FinishType.GLOSSY,
      basePrice: 1500,
      mrp: 1800,
      containerSize: 10,
      containerType: 'Bucket',
      unitOfMeasure: 'L',
      reorderLevel: 10,
      reorderQuantity: 30,
    },
    {
      sku: 'P-201',
      name: 'WeatherShield Stone Grey',
      description: 'Durable exterior grey paint',
      categoryId: categories[1].id,
      brand: 'Modern Colours',
      finishType: FinishType.SEMI_GLOSSY,
      basePrice: 1550,
      mrp: 1850,
      containerSize: 10,
      containerType: 'Bucket',
      unitOfMeasure: 'L',
      reorderLevel: 10,
      reorderQuantity: 30,
    },
    {
      sku: 'P-300',
      name: 'Teak Wood Varnish',
      description: 'Premium teak wood finish',
      categoryId: categories[2].id,
      brand: 'Modern Colours',
      finishType: FinishType.GLOSSY,
      basePrice: 800,
      mrp: 1000,
      containerSize: 1,
      containerType: 'Can',
      unitOfMeasure: 'L',
      reorderLevel: 25,
      reorderQuantity: 60,
    },
    {
      sku: 'P-301',
      name: 'Mahogany Stain',
      description: 'Rich mahogany wood stain',
      categoryId: categories[2].id,
      brand: 'Modern Colours',
      finishType: FinishType.MATTE,
      basePrice: 750,
      mrp: 950,
      containerSize: 1,
      containerType: 'Can',
      unitOfMeasure: 'L',
      reorderLevel: 30,
      reorderQuantity: 70,
    },
    {
      sku: 'P-400',
      name: 'Wall Primer White',
      description: 'Universal wall primer',
      categoryId: categories[3].id,
      brand: 'Modern Colours',
      finishType: FinishType.MATTE,
      basePrice: 600,
      mrp: 750,
      containerSize: 5,
      containerType: 'Bucket',
      unitOfMeasure: 'L',
      reorderLevel: 30,
      reorderQuantity: 80,
    },
  ];

  const products = [];
  for (const prodData of productsData) {
    const product = await prisma.product.upsert({
      where: { sku: prodData.sku },
      update: {},
      create: prodData,
    });
    products.push(product);
    console.log(`Created product: ${product.name}`);
  }

  // Create Inventory for all products across warehouses
  let inventoryCount = 0;
  for (const product of products) {
    for (const warehouse of warehouses) {
      const quantity = Math.floor(Math.random() * 200) + 50; // 50-250 units
      await prisma.inventory.upsert({
        where: {
          productId_warehouseId_batchNumber: {
            productId: product.id,
            warehouseId: warehouse.id,
            batchNumber: `BATCH-${Date.now()}-${inventoryCount}`,
          },
        },
        update: {},
        create: {
          productId: product.id,
          warehouseId: warehouse.id,
          quantity: quantity,
          batchNumber: `BATCH-${Date.now()}-${inventoryCount}`,
          status: 'AVAILABLE',
        },
      });
      inventoryCount++;
    }
  }
  console.log(`Created ${inventoryCount} inventory records`);

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

