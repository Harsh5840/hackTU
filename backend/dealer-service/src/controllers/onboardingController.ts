import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as onboardingService from '../services/onboardingService';
import { logger } from '../utils/logger';

export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const result = await onboardingService.registerDealer(req.body);
    res.status(201).json({
      success: true,
      message: "Registration successful. Your application is under review.",
      data: result
    });
  } catch (error: any) {
    logger.error('Registration error', { error: error.message });
    if (error.message.includes('already registered')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
