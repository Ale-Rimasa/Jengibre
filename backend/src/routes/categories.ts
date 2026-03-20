import { Router } from 'express';
import { categoryController } from '../controllers/categoryController';
import { verifyToken, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/categories — public (active only) or admin (all)
router.get('/', verifyToken, categoryController.getAll);

// POST /api/categories — admin only
router.post('/', verifyToken, requireAuth, categoryController.create);

// PUT /api/categories/:id — admin only
router.put('/:id', verifyToken, requireAuth, categoryController.update);

// DELETE /api/categories/:id — admin only
router.delete('/:id', verifyToken, requireAuth, categoryController.remove);

export default router;
