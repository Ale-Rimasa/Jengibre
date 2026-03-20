import { Request, Response, NextFunction } from 'express';
import { orderService, CreateOrderData } from '../services/orderService';

export const orderController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerName, customerPhone, customerEmail, customerAddress, notes, total, items } = req.body;

      if (!customerName || !customerPhone || !total || !items?.length) {
        res.status(400).json({ error: 'Missing required order fields' });
        return;
      }

      const orderData: CreateOrderData = {
        customerName: String(customerName).trim(),
        customerPhone: String(customerPhone).trim(),
        customerEmail: customerEmail ? String(customerEmail).trim() : undefined,
        customerAddress: customerAddress ? String(customerAddress).trim() : undefined,
        notes: notes ? String(notes).trim() : undefined,
        total: Number(total),
        items: items.map((item: Record<string, unknown>) => ({
          productId: item.productId ? Number(item.productId) : undefined,
          productName: String(item.productName),
          productImg: String(item.productImg || ''),
          price: Number(item.price),
          quantity: Number(item.quantity),
          subtotal: Number(item.subtotal),
        })),
      };

      const order = await orderService.create(orderData);
      res.status(201).json({ order, message: 'Order created successfully' });
    } catch (err) {
      next(err);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await orderService.getAll();
      res.json({ orders });
    } catch (err) {
      next(err);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) { res.status(400).json({ error: 'Invalid order ID' }); return; }
      const order = await orderService.getById(id);
      res.json({ order });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) { res.status(400).json({ error: 'Invalid order ID' }); return; }
      const { status } = req.body;
      if (!status) { res.status(400).json({ error: 'Status is required' }); return; }
      const order = await orderService.updateStatus(id, status);
      res.json({ order, message: 'Order status updated' });
    } catch (err) {
      next(err);
    }
  },
};
