import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { body } from 'express-validator';

const router = Router();

router.get('/', orderController.getAllOrders);

router.post(
  '/create',
  [
    body('items').isArray({ min: 1 }),
    body('deliveryAddress').isObject()
  ],
  orderController.createOrder
);

router.get('/:id', orderController.getOrder);

router.patch('/:id', orderController.updateOrder);

export default router;
