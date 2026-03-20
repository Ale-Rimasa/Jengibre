import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { verifyToken, requireAuth } from '../middleware/auth';

const router = Router();

// POST /api/orders — public (customer places order)
router.post('/', orderController.create);

// GET /api/orders — admin only
router.get('/', verifyToken, requireAuth, orderController.getAll);

// GET /api/orders/:id — admin only
router.get('/:id', verifyToken, requireAuth, orderController.getOne);

// PATCH /api/orders/:id/status — admin only
router.patch('/:id/status', verifyToken, requireAuth, orderController.updateStatus);

export default router;
