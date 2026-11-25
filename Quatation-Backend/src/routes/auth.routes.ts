import { Router } from 'express';
import { login, me, logout, updatePassword } from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.post('/login', login);
router.get('/me', authMiddleware, me);
router.put('/password', authMiddleware, updatePassword);
router.post('/logout', authMiddleware, logout);

export default router;