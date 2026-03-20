import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ProductFilters {
  search?: string;
  category?: string;
  includeInactive?: boolean;
}

export interface CreateProductData {
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  stock: number;
  images?: string[];
}

export interface UpdateProductData {
  name?: string;
  price?: number;
  category?: string;
  description?: string;
  image?: string;
  stock?: number;
  active?: boolean;
  images?: string[];
}

export const productService = {
  async getAll(filters: ProductFilters = {}) {
    const { search, category, includeInactive = false } = filters;

    const where: Record<string, unknown> = {};

    // Only show active products unless admin requests all
    if (!includeInactive) {
      where.active = true;
    }

    // Category filter
    if (category && category !== 'todas') {
      where.category = category;
    }

    // Search filter (case insensitive on name and description)
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    return prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: number) {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }

    return product;
  },

  async create(data: CreateProductData) {
    return prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        category: data.category,
        description: data.description,
        image: data.image,
        stock: data.stock,
        images: data.images ?? [],
        active: true,
      },
    });
  },

  async update(id: number, data: UpdateProductData) {
    // Check exists
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }

    return prisma.product.update({
      where: { id },
      data,
    });
  },

  async softDelete(id: number) {
    // Check exists
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }

    return prisma.product.update({
      where: { id },
      data: { active: false },
    });
  },
};
