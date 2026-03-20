import { Router } from 'express';
import {
  productController,
  productValidation,
  productUpdateValidation,
} from '../controllers/productController';
import { verifyToken, requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// GET /api/products - public with optional search/category
router.get('/', verifyToken, productController.getAll);

// GET /api/products/:id - public
router.get('/:id', productController.getOne);

// POST /api/products - admin only
router.post(
  '/',
  verifyToken,
  requireAuth,
  productValidation,
  validate,
  productController.create
);

// PUT /api/products/:id - admin only
router.put(
  '/:id',
  verifyToken,
  requireAuth,
  productUpdateValidation,
  validate,
  productController.update
);

// DELETE /api/products/:id - admin only (soft delete)
router.delete('/:id', verifyToken, requireAuth, productController.remove);

export default router;
