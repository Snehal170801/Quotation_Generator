import { Router } from 'express';
import { getFields, createField, updateField, deleteField } from '../controllers/customerField.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getFields);
router.post('/', createField);
router.put('/:id', updateField);
router.delete('/:id', deleteField);

export default router;
