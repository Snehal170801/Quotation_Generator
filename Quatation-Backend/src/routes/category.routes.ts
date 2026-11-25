import { Router } from 'express';
import {
  createParent,
  createChild,
  getTree,
  getParents,
  getChildren,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { isAdmin, isSales } from '../middleware/role.middleware.js';

const router = Router();

router.post('/parent', authMiddleware, isAdmin, createParent);
router.post('/child', authMiddleware, isAdmin, createChild);
router.get('/tree', authMiddleware, isSales, getTree);
router.get('/parents', authMiddleware, isAdmin, getParents);
router.get('/:parentId/children', authMiddleware, isSales, getChildren);
router.put('/:id', authMiddleware, isAdmin, updateCategory);
router.delete('/:id', authMiddleware, isAdmin, deleteCategory);

export default router;