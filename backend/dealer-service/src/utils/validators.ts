import { body } from 'express-validator';

export const registrationSchema = [
  body('businessName').isString().isLength({ min: 3, max: 255 }),
  body('businessType').isIn(['PROPRIETORSHIP', 'PARTNERSHIP', 'PRIVATE_LIMITED', 'LLP']),
  body('gstNumber').matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).withMessage('Invalid GST format'),
  body('panNumber').matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).withMessage('Invalid PAN format'),
  
  body('contactPerson.firstName').notEmpty(),
  body('contactPerson.lastName').notEmpty(),
  body('contactPerson.email').isEmail(),
  body('contactPerson.phone').matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number'),
  
  body('businessAddress.addressLine1').notEmpty(),
  body('businessAddress.city').notEmpty(),
  body('businessAddress.state').notEmpty(),
  body('businessAddress.pincode').matches(/^[1-9][0-9]{5}$/).withMessage('Invalid Pincode'),
  
  body('bankDetails.accountNumber').notEmpty(),
  body('bankDetails.ifscCode').matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage('Invalid IFSC format'),
  
  body('password').isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  }),
  body('agreedToTerms').equals('true').withMessage('Must agree to terms')
];

export const reviewSchema = [
  body('rating').isInt({ min: 1, max: 5 }),
  body('review').optional().isString().isLength({ max: 1000 }),
  body('orderId').isUUID()
];
