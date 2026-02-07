import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { body } from 'express-validator';

const router = Router();

router.post(
  '/create',
  [
    body('items').isArray({ min: 1 }),
    body('deliveryAddress').isObject()
  ],
  orderController.createOrder
);

router.get('/:id', orderController.getOrder);

export default router;
