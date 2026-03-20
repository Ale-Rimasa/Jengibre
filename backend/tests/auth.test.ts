import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

// Import setup to ensure mocks are configured
import './setup';

const prisma = new PrismaClient();
const mockPrismaUser = (prisma as any).user;

describe('Authentication API', () => {
  const validUser = {
    id: 1,
    email: 'admin@jengibre.com',
    password: '', // Will be set in beforeAll
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    // Hash the password for mock responses
    validUser.password = await bcrypt.hash('ReyPerseo2026-', 10);
  });

  describe('POST /api/auth/login', () => {
    it('should return 200 and set cookie with valid credentials', async () => {
      mockPrismaUser.findUnique.mockResolvedValueOnce(validUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@jengibre.com', password: 'ReyPerseo2026-' })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('admin@jengibre.com');
      expect(response.body.user.password).toBeUndefined();

      // Check that cookie is set
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('token=');
      expect(cookies[0]).toContain('HttpOnly');
    });

    it('should return 401 with invalid password', async () => {
      mockPrismaUser.findUnique.mockResolvedValueOnce(validUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@jengibre.com', password: 'wrongpassword' })
        .expect(401);

      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should return 401 with non-existent email', async () => {
      mockPrismaUser.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'anypassword' })
        .expect(401);

      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should return 400 with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email', password: 'somepassword' })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@jengibre.com' })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return 200 and clear cookie', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.message).toBe('Logged out successfully');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });

    it('should return 200 with valid cookie', async () => {
      // First login to get cookie
      mockPrismaUser.findUnique.mockResolvedValueOnce(validUser);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@jengibre.com', password: 'ReyPerseo2026-' });

      const cookies = loginResponse.headers['set-cookie'];
      expect(cookies).toBeDefined();

      // Use cookie for /me request
      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookies[0])
        .expect(200);

      expect(meResponse.body.user).toBeDefined();
      expect(meResponse.body.user.email).toBe('admin@jengibre.com');
      expect(meResponse.body.user.role).toBe('admin');
    });

    it('should return 401 with invalid/expired token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', 'token=invalid.jwt.token')
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });
  });
});
