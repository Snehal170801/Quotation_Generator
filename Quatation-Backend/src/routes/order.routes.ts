import { Router } from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus, deleteOrder } from '../controllers/order.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { isAdmin, isSales } from '../middleware/role.middleware.js';

const router = Router();

router.post('/',              authMiddleware, isSales, createOrder);
router.get('/',               authMiddleware, isSales, getOrders);
router.get('/:id',            authMiddleware, isSales, getOrderById);
router.put('/:id/status',     authMiddleware, isSales, updateOrderStatus);
router.delete('/:id',         authMiddleware, isAdmin, deleteOrder);

export default router;
