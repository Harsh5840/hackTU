import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting dealer service seed...');

  // Create sample dealers
  const dealer1 = await prisma.dealer.upsert({
    where: { email: 'rajesh@mumbaidist.com' },
    update: {},
    create: {
      userId: 'dealer-001',
      companyName: 'Mumbai Paint Distributors',
      businessType: 'PRIVATE_LIMITED',
      gstin: '27AAACM1234A1Z5',
      pan: 'AAACM1234A',
      contactPerson: 'Rajesh Kumar',
      email: 'rajesh@mumbaidist.com',
      phone: '+919876543210',
      dealerTier: 1,
      creditLimit: 500000,
      addressLine1: '123 Market Street',
      addressLine2: 'Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400058',
    },
  });
  console.log(`Created dealer: ${dealer1.companyName}`);

  const dealer2 = await prisma.dealer.upsert({
    where: { email: 'amit@delhihw.com' },
    update: {},
    create: {
      userId: 'dealer-002',
      companyName: 'Delhi Hardware & Paints',
      businessType: 'PARTNERSHIP',
      gstin: '07AACDH9876B1Z3',
      pan: 'AACDH9876B',
      contactPerson: 'Amit Singh',
      email: 'amit@delhihw.com',
      phone: '+919876543211',
      dealerTier: 1,
      creditLimit: 400000,
      addressLine1: '456 Nehru Place',
      addressLine2: 'Commercial Complex',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110019',
    },
  });
  console.log(`Created dealer: ${dealer2.companyName}`);

  const dealer3 = await prisma.dealer.upsert({
    where: { email: 'suresh@blrpaints.com' },
    update: {},
    create: {
      userId: 'dealer-003',
      companyName: 'Bangalore Paint Hub',
      businessType: 'PRIVATE_LIMITED',
      gstin: '29AACBP5432C1Z8',
      pan: 'AACBP5432C',
      contactPerson: 'Suresh Reddy',
      email: 'suresh@blrpaints.com',
      phone: '+919876543212',
      dealerTier: 2,
      creditLimit: 300000,
      addressLine1: '789 MG Road',
      addressLine2: 'Near Metro Station',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
    },
  });
  console.log(`Created dealer: ${dealer3.companyName}`);

  const dealer4 = await prisma.dealer.upsert({
    where: { email: 'priya@punecolors.com' },
    update: {},
    create: {
      userId: 'dealer-004',
      companyName: 'Pune Color Depot',
      businessType: 'PROPRIETORSHIP',
      gstin: '27AACPC3210D1Z6',
      pan: 'AACPC3210D',
      contactPerson: 'Priya Sharma',
      email: 'priya@punecolors.com',
      phone: '+919876543213',
      dealerTier: 2,
      creditLimit: 250000,
      addressLine1: '321 FC Road',
      addressLine2: 'Shivaji Nagar',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411005',
    },
  });
  console.log(`Created dealer: ${dealer4.companyName}`);

  const dealer5 = await prisma.dealer.upsert({
    where: { email: 'venkat@hydpaints.com' },
    update: {},
    create: {
      userId: 'dealer-005',
      companyName: 'Hyderabad Paint Palace',
      businessType: 'PARTNERSHIP',
      gstin: '36AACHP8765E1Z4',
      pan: 'AACHP8765E',
      contactPerson: 'Venkat Rao',
      email: 'venkat@hydpaints.com',
      phone: '+919876543214',
      dealerTier: 2,
      creditLimit: 150000,
      addressLine1: '555 Abids',
      addressLine2: 'Sultan Bazaar',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
    },
  });
  console.log(`Created dealer: ${dealer5.companyName}`);

  console.log('✅ Dealer service seeding finished. Created 5 dealers.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
