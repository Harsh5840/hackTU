import { PrismaClient, BusinessType, VerificationStatus, AccountStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding dealers...');

  // Create 5 sample dealers
  const dealer1 = await prisma.dealer.create({
    data: {
      dealerCode: 'DLR-MUM-001',
      userId: 'user-' + Math.random().toString(36).substr(2, 9),
      businessName: 'Premium Paints Mumbai',
      businessType: BusinessType.PRIVATE_LIMITED,
      gstNumber: '27AABCP1234A1Z5',
      panNumber: 'AABCP1234A',
      establishmentYear: 2015,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      designation: 'Proprietor',
      email: 'rajesh.kumar@premiumpaints.com',
      phone: '+919876543210',
      addressLine1: 'Shop 12, Andheri Market',
      addressLine2: 'Near Railway Station',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400069',
      country: 'India',
      bankAccountName: 'Premium Paints Mumbai',
      bankAccountNumber: '1234567890',
      bankIfscCode: 'HDFC0001234',
      bankName: 'HDFC Bank',
      bankBranchName: 'Andheri West',
      creditLimit: 500000,
      currentCreditUsed: 120000,
      availableCredit: 380000,
      totalOrderValue: 2500000,
      totalOrderCount: 45,
      lastOrderDate: new Date('2026-02-01'),
      verificationStatus: VerificationStatus.APPROVED,
      accountStatus: AccountStatus.ACTIVE,
      isActive: true,
      kycVerified: true,
      approvedAt: new Date('2025-12-01'),
    },
  });
  console.log(`Created dealer: ${dealer1.businessName}`);

  const dealer2 = await prisma.dealer.create({
    data: {
      dealerCode: 'DLR-DEL-002',
      userId: 'user-' + Math.random().toString(36).substr(2, 9),
      businessName: 'Capital Colors Delhi',
      businessType: BusinessType.PARTNERSHIP,
      gstNumber: '07AABCC5678B1Z1',
      panNumber: 'AABCC5678B',
      establishmentYear: 2018,
      firstName: 'Amit',
      lastName: 'Sharma',
      designation: 'Partner',
      email: 'amit.sharma@capitalcolors.com',
      phone: '+919876543211',
      addressLine1: 'Plot 45, Okhla Industrial Area',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110020',
      country: 'India',
      bankAccountName: 'Capital Colors Delhi',
      bankAccountNumber: '2345678901',
      bankIfscCode: 'ICIC0002345',
      bankName: 'ICICI Bank',
      bankBranchName: 'Okhla',
      creditLimit: 300000,
      currentCreditUsed: 85000,
      availableCredit: 215000,
      totalOrderValue: 1800000,
      totalOrderCount: 32,
      lastOrderDate: new Date('2026-01-28'),
      verificationStatus: VerificationStatus.APPROVED,
      accountStatus: AccountStatus.ACTIVE,
      isActive: true,
      kycVerified: true,
      approvedAt: new Date('2025-11-15'),
    },
  });
  console.log(`Created dealer: ${dealer2.businessName}`);

  const dealer3 = await prisma.dealer.create({
    data: {
      dealerCode: 'DLR-BLR-003',
      userId: 'user-' + Math.random().toString(36).substr(2, 9),
      businessName: 'Bangalore Paint Depot',
      businessType: BusinessType.PROPRIETORSHIP,
      gstNumber: '29AABCB9012C1Z2',
      panNumber: 'AABCB9012C',
      establishmentYear: 2020,
      firstName: 'Suresh',
      lastName: 'Reddy',
      designation: 'Owner',
      email: 'suresh.reddy@blrdepot.com',
      phone: '+919876543212',
      addressLine1: 'Whitefield Main Road',
      addressLine2: 'Near Forum Mall',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560066',
      country: 'India',
      bankAccountName: 'Bangalore Paint Depot',
      bankAccountNumber: '3456789012',
      bankIfscCode: 'SBI0003456',
      bankName: 'State Bank of India',
      bankBranchName: 'Whitefield',
      creditLimit: 250000,
      currentCreditUsed: 60000,
      availableCredit: 190000,
      totalOrderValue: 950000,
      totalOrderCount: 18,
      lastOrderDate: new Date('2026-02-03'),
      verificationStatus: VerificationStatus.APPROVED,
      accountStatus: AccountStatus.ACTIVE,
      isActive: true,
      kycVerified: true,
      approvedAt: new Date('2025-12-20'),
    },
  });
  console.log(`Created dealer: ${dealer3.businessName}`);

  const dealer4 = await prisma.dealer.create({
    data: {
      dealerCode: 'DLR-PUN-004',
      userId: 'user-' + Math.random().toString(36).substr(2, 9),
      businessName: 'Pune Paint Traders',
      businessType: BusinessType.LLP,
      gstNumber: '27AABCP3456D1Z3',
      panNumber: 'AABCP3456D',
      establishmentYear: 2017,
      firstName: 'Prakash',
      lastName: 'Deshmukh',
      designation: 'Managing Partner',
      email: 'prakash.d@punetraders.com',
      phone: '+919876543213',
      addressLine1: 'Kothrud Market Complex',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411038',
      country: 'India',
      bankAccountName: 'Pune Paint Traders LLP',
      bankAccountNumber: '4567890123',
      bankIfscCode: 'AXIS0004567',
      bankName: 'Axis Bank',
      bankBranchName: 'Kothrud',
      creditLimit: 400000,
      currentCreditUsed: 150000,
      availableCredit: 250000,
      totalOrderValue: 2100000,
      totalOrderCount: 38,
      lastOrderDate: new Date('2026-01-30'),
      verificationStatus: VerificationStatus.APPROVED,
      accountStatus: AccountStatus.ACTIVE,
      isActive: true,
      kycVerified: true,
      approvedAt: new Date('2025-10-10'),
    },
  });
  console.log(`Created dealer: ${dealer4.businessName}`);

  const dealer5 = await prisma.dealer.create({
    data: {
      dealerCode: 'DLR-HYD-005',
      userId: 'user-' + Math.random().toString(36).substr(2, 9),
      businessName: 'Hyderabad Color House',
      businessType: BusinessType.PRIVATE_LIMITED,
      gstNumber: '36AABCH7890E1Z4',
      panNumber: 'AABCH7890E',
      establishmentYear: 2019,
      firstName: 'Venkat',
      lastName: 'Rao',
      designation: 'Director',
      email: 'venkat.rao@hydcolorhouse.com',
      phone: '+919876543214',
      addressLine1: 'Kukatpally Industrial Estate',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500072',
      country: 'India',
      bankAccountName: 'Hyderabad Color House Pvt Ltd',
      bankAccountNumber: '5678901234',
      bankIfscCode: 'HDFC0005678',
      bankName: 'HDFC Bank',
      bankBranchName: 'Kukatpally',
      creditLimit: 350000,
      currentCreditUsed: 95000,
      availableCredit: 255000,
      totalOrderValue: 1650000,
      totalOrderCount: 28,
      lastOrderDate: new Date('2026-02-05'),
      verificationStatus: VerificationStatus.APPROVED,
      accountStatus: AccountStatus.ACTIVE,
      isActive: true,
      kycVerified: true,
      approvedAt: new Date('2025-11-01'),
    },
  });
  console.log(`Created dealer: ${dealer5.businessName}`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
