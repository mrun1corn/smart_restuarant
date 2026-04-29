import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByTable,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/order.controller.js';
import { verifyToken } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createOrderSchema, updateOrderStatusSchema } from '../schemas/order.schema.js';

const router = Router();

router.post('/', validate(createOrderSchema), createOrder); // Public (Customers placing orders)
router.get('/', verifyToken, getAllOrders); // Staff only
router.get('/:id', verifyToken, getOrderById); // Staff only
router.get('/table/:tableId', verifyToken, getOrdersByTable); // Staff only
router.patch('/:id/status', verifyToken, validate(updateOrderStatusSchema), updateOrderStatus); // Staff only
router.delete('/:id', verifyToken, cancelOrder); // Staff only

export default router;
