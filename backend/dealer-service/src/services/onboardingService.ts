import bcrypt from 'bcryptjs';
import { prisma } from '../config/infra';
import { publishEvent } from '../events/publisher';
import { logger } from '../utils/logger';

export const registerDealer = async (data: any) => {
  const { 
    businessName, businessType, gstNumber, panNumber, 
    contactPerson, businessAddress, bankDetails, password 
  } = data;

  // 1. Uniqueness Checks
  const existing = await prisma.dealer.findFirst({
    where: {
      OR: [
        { email: contactPerson.email },
        { gstNumber },
        { panNumber },
        { phone: contactPerson.phone }
      ]
    }
  });

  if (existing) {
    throw new Error('Email, GST, PAN or Phone already registered');
  }

  // 2. Hash Password
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. Generate Dealer Code
  const year = new Date().getFullYear();
  const count = await prisma.dealer.count();
  const dealerCode = `DLR-${year}-${(count + 1).toString().padStart(4, '0')}`;

  // 4. Create Transaction for User (Internal Auth) and Dealer
  // Note: In a real microservice, we would call the Auth Service API to create the user.
  // For this project, we assume the Dealer Service manages its own Dealer Users locally or via events.
  // We'll create the dealer record.
  
  const dealer = await prisma.dealer.create({
    data: {
      dealerCode,
      userId: 'pending-auth', // This would be the ID from Auth Service
      businessName,
      businessType,
      gstNumber,
      panNumber,
      
      firstName: contactPerson.firstName,
      lastName: contactPerson.lastName,
      designation: contactPerson.designation,
      email: contactPerson.email,
      phone: contactPerson.phone,
      
      addressLine1: businessAddress.addressLine1,
      addressLine2: businessAddress.addressLine2,
      city: businessAddress.city,
      state: businessAddress.state,
      pincode: businessAddress.pincode,
      
      bankAccountName: bankDetails.accountName,
      bankAccountNumber: bankDetails.accountNumber,
      bankIfscCode: bankDetails.ifscCode,
      bankName: bankDetails.bankName,
      bankBranchName: bankDetails.branchName,
      
      verificationStatus: 'PENDING',
      creditLimit: 0,
      availableCredit: 0
    }
  });

  // 5. Publish Event
  publishEvent('dealer.registered', dealer.id, {
    businessName: dealer.businessName,
    email: dealer.email
  });

  logger.info(`Dealer registered: ${dealer.dealerCode}`, { dealerId: dealer.id });

  return {
    dealerId: dealer.id,
    dealerCode: dealer.dealerCode,
    businessName: dealer.businessName,
    contactEmail: dealer.email,
    verificationStatus: 'PENDING'
  };
};
