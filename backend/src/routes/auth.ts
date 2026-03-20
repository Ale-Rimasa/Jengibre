import { Router } from 'express';
import {
  authController,
  loginValidation,
} from '../controllers/authController';
import { verifyToken, requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// POST /api/auth/login
router.post('/login', loginValidation, validate, authController.login);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// GET /api/auth/me
router.get('/me', verifyToken, requireAuth, authController.me);

export default router;
