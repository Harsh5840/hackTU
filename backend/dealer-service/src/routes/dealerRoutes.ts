import { Router } from 'express';
import * as onboardingController from '../controllers/onboardingController';
import * as dealerController from '../controllers/dealerController';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { registrationSchema } from '../utils/validators';

const router = Router();

// Onboarding
router.post('/register', registrationSchema, onboardingController.register);

// Profile (Protected)
router.get('/me', authMiddleware, dealerController.getMe);
router.put('/me/profile', authMiddleware, dealerController.updateMe);
router.get('/hierarchy', authMiddleware, dealerController.getHierarchy);

export default router;
