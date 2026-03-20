import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateOrderData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  notes?: string;
  total: number;
  items: {
    productId?: number;
    productName: string;
    productImg: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
}

export const orderService = {
  async create(data: CreateOrderData) {
    return prisma.order.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        customerAddress: data.customerAddress,
        notes: data.notes,
        total: data.total,
        status: 'pending',
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productImg: item.productImg,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subtotal,
          })),
        },
      },
      include: { items: true },
    });
  },

  async getAll() {
    return prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: number) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    return order;
  },

  async updateStatus(id: number, status: string) {
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw Object.assign(new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`), { statusCode: 400 });
    }
    return prisma.order.update({ where: { id }, data: { status } });
  },
};
