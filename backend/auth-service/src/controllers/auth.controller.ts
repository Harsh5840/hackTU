import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { logger } from '../utils/logger';

export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({ success: true, message: 'Registration successful', data: result });
  } catch (err: any) {
    logger.error(err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUser(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    logger.error(err.message);
    res.status(401).json({ success: false, message: err.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({ success: true, message: 'If user exists, email sent' });
  } catch (err: any) {
    logger.error(err.message);
    res.status(500).json({ success: false, message: 'Error processing request' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    await authService.resetPassword(req.body);
    res.json({ success: true, message: 'Password reset successful' });
  } catch (err: any) {
    logger.error(err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};
