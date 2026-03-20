import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

// Import setup to ensure mocks are configured
import './setup';

const prisma = new PrismaClient();
const mockPrismaUser = (prisma as any).user;
const mockPrismaProduct = (prisma as any).product;

const mockProducts = [
  {
    id: 1,
    name: 'Taza Espresso Terracota',
    price: 2800,
    category: 'tazas',
    description: 'Elegante taza de espresso elaborada a mano',
    image: '/images/producto-1.jpg',
    stock: 15,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: 'Bowl Ensalada Grande',
    price: 4800,
    category: 'bowls',
    description: 'Gran bowl para ensaladas familiar',
    image: '/images/producto-2.jpg',
    stock: 7,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const validUser = {
  id: 1,
  email: 'admin@jengibre.com',
  password: '',
  role: 'admin',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Helper to get auth cookie
async function getAuthCookie(): Promise<string> {
  mockPrismaUser.findUnique.mockResolvedValueOnce(validUser);

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@jengibre.com', password: 'ReyPerseo2026-' });

  return loginResponse.headers['set-cookie'][0];
}

describe('Products API', () => {
  beforeAll(async () => {
    validUser.password = await bcrypt.hash('ReyPerseo2026-', 10);
  });

  describe('GET /api/products', () => {
    it('should return 200 with array of products', async () => {
      mockPrismaProduct.findMany.mockResolvedValueOnce(mockProducts);

      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.products).toBeDefined();
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products).toHaveLength(2);
    });

    it('should return filtered results when searching for "taza"', async () => {
      const tazaProducts = mockProducts.filter((p) =>
        p.name.toLowerCase().includes('taza')
      );
      mockPrismaProduct.findMany.mockResolvedValueOnce(tazaProducts);

      const response = await request(app)
        .get('/api/products?search=taza')
        .expect(200);

      expect(response.body.products).toBeDefined();
      expect(response.body.products.length).toBe(1);
      expect(response.body.products[0].name).toContain('Taza');
    });

    it('should filter by category', async () => {
      const bowlProducts = mockProducts.filter((p) => p.category === 'bowls');
      mockPrismaProduct.findMany.mockResolvedValueOnce(bowlProducts);

      const response = await request(app)
        .get('/api/products?category=bowls')
        .expect(200);

      expect(response.body.products).toBeDefined();
      expect(response.body.products[0].category).toBe('bowls');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a single product', async () => {
      mockPrismaProduct.findUnique.mockResolvedValueOnce(mockProducts[0]);

      const response = await request(app)
        .get('/api/products/1')
        .expect(200);

      expect(response.body.product).toBeDefined();
      expect(response.body.product.id).toBe(1);
    });

    it('should return 404 for non-existent product', async () => {
      mockPrismaProduct.findUnique.mockResolvedValueOnce(null);

      await request(app).get('/api/products/9999').expect(404);
    });
  });

  describe('POST /api/products', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'New Taza',
          price: 3000,
          category: 'tazas',
          description: 'A new ceramic cup',
          image: '/images/new.jpg',
          stock: 10,
        })
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });

    it('should create product with valid auth and data', async () => {
      const authCookie = await getAuthCookie();

      const newProduct = {
        id: 3,
        name: 'Nueva Taza Artesanal',
        price: 3200,
        category: 'tazas',
        description: 'Hermosa taza artesanal de cerámica',
        image: '/images/producto-13.jpg',
        stock: 8,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaProduct.create.mockResolvedValueOnce(newProduct);

      const response = await request(app)
        .post('/api/products')
        .set('Cookie', authCookie)
        .send({
          name: 'Nueva Taza Artesanal',
          price: 3200,
          category: 'tazas',
          description: 'Hermosa taza artesanal de cerámica',
          image: '/images/producto-13.jpg',
          stock: 8,
        })
        .expect(201);

      expect(response.body.product).toBeDefined();
      expect(response.body.product.name).toBe('Nueva Taza Artesanal');
    });

    it('should return 400 with invalid data', async () => {
      const authCookie = await getAuthCookie();

      await request(app)
        .post('/api/products')
        .set('Cookie', authCookie)
        .send({
          name: '', // empty name
          price: -100, // negative price
          category: 'invalid_category',
        })
        .expect(400);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update product with valid auth', async () => {
      const authCookie = await getAuthCookie();

      const updatedProduct = { ...mockProducts[0], price: 3500 };
      mockPrismaProduct.findUnique.mockResolvedValueOnce(mockProducts[0]);
      mockPrismaProduct.update.mockResolvedValueOnce(updatedProduct);

      const response = await request(app)
        .put('/api/products/1')
        .set('Cookie', authCookie)
        .send({ price: 3500 })
        .expect(200);

      expect(response.body.product).toBeDefined();
      expect(response.body.product.price).toBe(3500);
    });

    it('should return 401 without auth', async () => {
      await request(app)
        .put('/api/products/1')
        .send({ price: 3500 })
        .expect(401);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should soft delete product with valid auth', async () => {
      const authCookie = await getAuthCookie();

      const deactivatedProduct = { ...mockProducts[0], active: false };
      mockPrismaProduct.findUnique.mockResolvedValueOnce(mockProducts[0]);
      mockPrismaProduct.update.mockResolvedValueOnce(deactivatedProduct);

      const response = await request(app)
        .delete('/api/products/1')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.message).toBe('Product deactivated successfully');
    });

    it('should return 401 without auth', async () => {
      await request(app).delete('/api/products/1').expect(401);
    });
  });
});
