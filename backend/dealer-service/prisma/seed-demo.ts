import { PrismaClient, BusinessType, VerificationStatus, AccountStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting dealer service seed for demo...');

  try {
    // Delete existing dealers
    await prisma.dealer.deleteMany({});
    console.log('Cleared existing dealers');

    // Create 5 demo dealers
    const dealer1 = await prisma.dealer.create({
      data: {
        dealerCode: 'DLR-DEMO-001',
        userId: 'demo-dealer-id', // Special ID for demo mode
        businessName: 'Demo Paint Distributors',
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
        availableCredit: 380000,
        dealerTier: 1,
        discountPercentage: 10,
        creditDays: 30,
        verificationStatus: VerificationStatus.APPROVED,
        accountStatus: AccountStatus.ACTIVE,
        approvedAt: new Date('2025-12-01'),
      },
    });
    console.log(`✅ Created dealer: ${dealer1.businessName}`);

    const dealer2 = await prisma.dealer.create({
      data: {
        dealerCode: 'DLR-DEL-002',
        userId: 'dealer-user-002',
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
        availableCredit: 215000,
        dealerTier: 1,
        discountPercentage: 8,
        creditDays: 30,
        verificationStatus: VerificationStatus.APPROVED,
        accountStatus: AccountStatus.ACTIVE,
        approvedAt: new Date('2025-11-15'),
      },
    });
    console.log(`✅ Created dealer: ${dealer2.businessName}`);

    const dealer3 = await prisma.dealer.create({
      data: {
        dealerCode: 'DLR-BLR-003',
        userId: 'dealer-user-003',
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
        availableCredit: 190000,
        dealerTier: 2,
        discountPercentage: 5,
        creditDays: 15,
        verificationStatus: VerificationStatus.APPROVED,
        accountStatus: AccountStatus.ACTIVE,
        approvedAt: new Date('2025-12-20'),
      },
    });
    console.log(`✅ Created dealer: ${dealer3.businessName}`);

    const dealer4 = await prisma.dealer.create({
      data: {
        dealerCode: 'DLR-PUN-004',
        userId: 'dealer-user-004',
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
        creditLimit: 200000,
        availableCredit: 150000,
        dealerTier: 2,
        discountPercentage: 5,
        creditDays: 15,
        verificationStatus: VerificationStatus.APPROVED,
        accountStatus: AccountStatus.ACTIVE,
        approvedAt: new Date('2025-10-10'),
      },
    });
    console.log(`✅ Created dealer: ${dealer4.businessName}`);

    const dealer5 = await prisma.dealer.create({
      data: {
        dealerCode: 'DLR-CHE-005',
        userId: 'dealer-user-005',
        businessName: 'Chennai Paint House',
        businessType: BusinessType.PRIVATE_LIMITED,
        gstNumber: '33AABCC7890E1Z4',
        panNumber: 'AABCC7890E',
        establishmentYear: 2019,
        firstName: 'Venkat',
        lastName: 'Iyer',
        designation: 'Director',
        email: 'venkat.iyer@chepainthouse.com',
        phone: '+919876543214',
        addressLine1: 'Anna Nagar Main Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600040',
        country: 'India',
        bankAccountName: 'Chennai Paint House Pvt Ltd',
        bankAccountNumber: '5678901234',
        bankIfscCode: 'SBIC0005678',
        bankName: 'SBI',
        bankBranchName: 'Anna Nagar',
        creditLimit: 350000,
        availableCredit: 280000,
        dealerTier: 1,
        discountPercentage: 8,
        creditDays: 30,
        verificationStatus: VerificationStatus.APPROVED,
        accountStatus: AccountStatus.ACTIVE,
        approvedAt: new Date('2025-09-15'),
      },
    });
    console.log(`✅ Created dealer: ${dealer5.businessName}`);

    console.log('✅ Dealer seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
