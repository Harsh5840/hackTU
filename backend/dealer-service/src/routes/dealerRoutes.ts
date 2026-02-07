import { Router } from 'express';
import * as onboardingController from '../controllers/onboardingController';
import * as dealerController from '../controllers/dealerController';
// import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware'; // DISABLED FOR DEMO
import { registrationSchema } from '../utils/validators';

const router = Router();

// Onboarding
router.post('/register', registrationSchema, onboardingController.register);

// Profile (No auth for demo)
router.get('/me', dealerController.getMe);
router.put('/me/profile', dealerController.updateMe);
router.get('/hierarchy', dealerController.getHierarchy);

// Admin routes - dealer management (No auth for demo)
router.get('/', dealerController.getAllDealers);
router.get('/:id', dealerController.getDealerById);
router.patch('/:id/status', dealerController.updateStatus);

export default router;
