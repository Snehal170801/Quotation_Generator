import { Router } from 'express';
import {
  createUser,
  getUsers,
  updateUser,
  deactivateUser,
} from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/role.middleware.js';

const router = Router();

router.post('/', authMiddleware, isAdmin, createUser);
router.get('/', authMiddleware, isAdmin, getUsers);
router.put('/:id', authMiddleware, isAdmin, updateUser);
router.delete('/:id', authMiddleware, isAdmin, deactivateUser);

export default router;