import { PrismaClient, UserRole, WarehouseType, FinishType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Super Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@moderncolours.com' },
    update: {},
    create: {
      email: 'admin@moderncolours.com',
      passwordHash: adminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      isVerified: true,
    },
  });
  console.log({ admin });

  // 2. Create Categories
  const categories = [
    { name: 'Interior Emulsions', slug: 'interior-emulsions' },
    { name: 'Exterior Emulsions', slug: 'exterior-emulsions' },
    { name: 'Enamels', slug: 'enamels' },
    { name: 'Primers', slug: 'primers' },
    { name: 'Stains & Varnishes', slug: 'stains-varnishes' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  
  const interiorCat = await prisma.category.findUnique({ where: { slug: 'interior-emulsions' } });

  // 3. Create Products
  if (interiorCat) {
    const products = Array.from({ length: 20 }).map((_, i) => ({
      sku: `INT-EML-${i + 100}`,
      name: `Modern Silk Glow ${i + 1}`,
      categoryId: interiorCat.id,
      containerSize: 10,
      containerType: 'Bucket',
      unitOfMeasure: 'L',
      basePrice: 2000 + (i * 100),
      mrp: 2500 + (i * 120),
      finishType: i % 2 === 0 ? FinishType.GLOSSY : FinishType.MATTE,
    }));

    for (const p of products) {
      await prisma.product.upsert({
        where: { sku: p.sku },
        update: {},
        create: p,
      });
    }
  }

  // 4. Create Warehouses
  const warehouses = [
    { code: 'WH-001', name: 'North Zone Hub', type: WarehouseType.DISTRIBUTION_CENTER, city: 'Delhi' },
    { code: 'WH-002', name: 'West Zone Hub', type: WarehouseType.WAREHOUSE, city: 'Mumbai' },
    { code: 'WH-003', name: 'South Factory', type: WarehouseType.MANUFACTURING, city: 'Chennai' },
  ];

  for (const wh of warehouses) {
    await prisma.warehouse.upsert({
      where: { code: wh.code },
      update: {},
      create: wh,
    });
  }

  // 5. Create Dealers
  const dealerPassword = await bcrypt.hash('dealer123', 10);
  const dealerUser = await prisma.user.create({
    data: {
      email: 'dealer1@example.com',
      passwordHash: dealerPassword,
      firstName: 'Rajesh',
      lastName: 'Gupta',
      role: UserRole.DEALER,
      isVerified: true,
      dealerProfile: {
        create: {
          businessName: 'Gupta Paints & Hardware',
          email: 'dealer1@example.com',
          phone: '9876543210',
          addressLine1: '123 Market Road',
          city: 'Jaipur',
          state: 'Rajasthan',
          pincode: '302001',
          gstNumber: '08AAAAA0000A1Z5'
        }
      }
    }
  });

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
