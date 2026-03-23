import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ProductFilters {
  search?: string;
  category?: string;
  includeInactive?: boolean;
  excludeId?: number;
  page?: number;
  limit?: number;
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
    const {
      search,
      category,
      includeInactive = false,
      excludeId,
      page = 1,
      limit = 12,
    } = filters;

    const where: Record<string, unknown> = {};

    if (!includeInactive) where.active = true;
    if (category && category !== 'todas') where.category = category;
    if (excludeId) where.id = { not: excludeId };

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
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
