import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting dealer service seed...');

  // Create sample dealers
  const dealersData = [
    {
      userId: 'dealer-001',
      companyName: 'Mumbai Paint Distributors',
      gstin: 'GSTIN001',
      pan: 'PAN001',
      contactPerson: 'Rajesh Kumar',
      email: 'rajesh@mumbaidist.com',
      phone: '+91 9876543210',
      dealerTier: 1, // Primary dealer
      creditLimit: 500000,
      outstandingBalance: 0,
      isActive: true,
      address: {
        line1: '123 Market Street',
        line2: 'Andheri West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400058',
        country: 'India',
      },
    },
    {
      userId: 'dealer-002',
      companyName: 'Delhi Hardware & Paints',
      gstin: 'GSTIN002',
      pan: 'PAN002',
      contactPerson: 'Amit Singh',
      email: 'amit@delhihw.com',
      phone: '+91 9876543211',
      dealerTier: 1, // Primary dealer
      creditLimit: 400000,
      outstandingBalance: 0,
      isActive: true,
      address: {
        line1: '456 Nehru Place',
        line2: 'Commercial Complex',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110019',
        country: 'India',
      },
    },
    {
      userId: 'dealer-003',
      companyName: 'Bangalore Paint Hub',
      gstin: 'GSTIN003',
      pan: 'PAN003',
      contactPerson: 'Suresh Reddy',
      email: 'suresh@blrpaints.com',
      phone: '+91 9876543212',
      dealerTier: 2, // Secondary dealer
      creditLimit: 300000,
      outstandingBalance: 0,
      isActive: true,
      address: {
        line1: '789 MG Road',
        line2: 'Near Metro Station',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India',
      },
    },
    {
      userId: 'dealer-004',
      companyName: 'Pune Color Depot',
      gstin: 'GSTIN004',
      pan: 'PAN004',
      contactPerson: 'Priya Sharma',
      email: 'priya@punecolors.com',
      phone: '+91 9876543213',
      dealerTier: 2, // Secondary dealer
      creditLimit: 250000,
      outstandingBalance: 0,
      isActive: true,
      address: {
        line1: '321 FC Road',
        line2: 'Shivaji Nagar',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411005',
        country: 'India',
      },
    },
    {
      userId: 'dealer-005',
      companyName: 'Hyderabad Paint Palace',
      gstin: 'GSTIN005',
      pan: 'PAN005',
      contactPerson: 'Venkat Rao',
      email: 'venkat@hydpaints.com',
      phone: '+91 9876543214',
      dealerTier: 2, // Secondary dealer
      creditLimit: 150000,
      outstandingBalance: 0,
      isActive: true,
      address: {
        line1: '555 Abids',
        line2: 'Sultan Bazaar',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500001',
        country: 'India',
      },
    },
  ];

  for (const dealerData of dealersData) {
    const dealer = await prisma.dealer.upsert({
      where: { userId: dealerData.userId },
      update: {},
      create: dealerData,
    });
    console.log(`Created dealer: ${dealer.companyName}`);
  }

  // Create some dealer orders (sample)
  const dealers = await prisma.dealer.findMany();
  console.log(`Created ${dealers.length} dealers`);

  console.log('✅ Dealer service seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
