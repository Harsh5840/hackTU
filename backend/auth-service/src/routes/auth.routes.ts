import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').notEmpty(),
    body('lastName').notEmpty()
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty()
  ],
  authController.login
);

router.post(
  '/forgot-password',
  [body('email').isEmail()],
  authController.forgotPassword
);

router.post(
  '/reset-password',
  [
    body('email').isEmail(),
    body('code').isLength({ min: 6 }),
    body('newPassword').isLength({ min: 8 })
  ],
  authController.resetPassword
);

export default router;
