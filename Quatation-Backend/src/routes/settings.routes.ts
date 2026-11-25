import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/role.middleware.js';

const router = Router();

router.get('/', authMiddleware, getSettings);
router.put('/', authMiddleware, isAdmin, updateSettings);

export default router;
