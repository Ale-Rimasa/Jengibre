import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { productService } from '../services/productService';

const VALID_CATEGORIES = [
  'tazas',
  'platos',
  'decoracion',
  'bowls',
  'jarrones',
  'set_vajilla',
];

// Validation rules for creating/updating products
export const productValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 200 })
    .withMessage('Name must not exceed 200 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('image').trim().notEmpty().withMessage('Image URL is required'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
];

export const productUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Name must not exceed 200 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('image').optional().trim().notEmpty().withMessage('Image URL cannot be empty'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean'),
];

export const productController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, category } = req.query;
      const isAdmin = !!req.user;

      const products = await productService.getAll({
        search: typeof search === 'string' ? search : undefined,
        category: typeof category === 'string' ? category : undefined,
        includeInactive: isAdmin,
      });

      res.status(200).json({ products });
    } catch (err) {
      next(err);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      const product = await productService.getById(id);
      res.status(200).json({ product });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, price, category, description, image, stock } = req.body;

      const product = await productService.create({
        name,
        price: parseFloat(price),
        category,
        description,
        image,
        stock: parseInt(stock, 10),
      });

      res.status(201).json({ product, message: 'Product created successfully' });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      const { name, price, category, description, image, stock, active } =
        req.body;

      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (category !== undefined) updateData.category = category;
      if (description !== undefined) updateData.description = description;
      if (image !== undefined) updateData.image = image;
      if (stock !== undefined) updateData.stock = parseInt(stock, 10);
      if (active !== undefined) updateData.active = active;

      const product = await productService.update(id, updateData);
      res.status(200).json({ product, message: 'Product updated successfully' });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      await productService.softDelete(id);
      res.status(200).json({ message: 'Product deactivated successfully' });
    } catch (err) {
      next(err);
    }
  },
};
