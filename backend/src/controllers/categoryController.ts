import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/categoryService';

export const categoryController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isAdmin = !!req.user;
      const categories = await categoryService.getAll(!isAdmin);
      res.json({ categories });
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug, label, order } = req.body;
      if (!slug || !label) { res.status(400).json({ error: 'slug and label are required' }); return; }
      const category = await categoryService.create({ slug, label, order: order ? Number(order) : 0 });
      res.status(201).json({ category, message: 'Category created' });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return; }
      const { label, active, order } = req.body;
      const category = await categoryService.update(id, {
        ...(label !== undefined && { label: String(label).trim() }),
        ...(active !== undefined && { active: Boolean(active) }),
        ...(order !== undefined && { order: Number(order) }),
      });
      res.json({ category, message: 'Category updated' });
    } catch (err) { next(err); }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return; }
      await categoryService.remove(id);
      res.json({ message: 'Category deleted' });
    } catch (err) { next(err); }
  },
};
