import { Router } from 'express';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { isAdmin, isSales } from '../middleware/role.middleware.js';

const router = Router();

router.post('/', authMiddleware, isSales, createCustomer);
router.get('/', authMiddleware, isSales, getCustomers);
router.get('/:id', authMiddleware, isSales, getCustomerById);
router.put('/:id', authMiddleware, isSales, updateCustomer);
router.delete('/:id', authMiddleware, isAdmin, deleteCustomer);

export default router;