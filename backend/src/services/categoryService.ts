import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateCategoryData {
  slug: string;
  label: string;
  order?: number;
}

export interface UpdateCategoryData {
  label?: string;
  active?: boolean;
  order?: number;
}

export const categoryService = {
  async getAll(onlyActive = false) {
    return prisma.category.findMany({
      where: onlyActive ? { active: true } : undefined,
      orderBy: [{ order: 'asc' }, { label: 'asc' }],
    });
  },

  async getById(id: number) {
    const cat = await prisma.category.findUnique({ where: { id } });
    if (!cat) throw Object.assign(new Error('Category not found'), { statusCode: 404 });
    return cat;
  },

  async create(data: CreateCategoryData) {
    const slug = data.slug.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) throw Object.assign(new Error('A category with this slug already exists'), { statusCode: 409 });
    return prisma.category.create({
      data: { slug, label: data.label.trim(), order: data.order ?? 0 },
    });
  },

  async update(id: number, data: UpdateCategoryData) {
    await this.getById(id);
    return prisma.category.update({ where: { id }, data });
  },

  async remove(id: number) {
    await this.getById(id);
    // Check if any products use this category
    const count = await prisma.product.count({ where: { category: (await this.getById(id)).slug } });
    if (count > 0) throw Object.assign(new Error(`Cannot delete: ${count} product(s) use this category`), { statusCode: 409 });
    return prisma.category.delete({ where: { id } });
  },
};
