import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export interface LoginResult {
  user: {
    id: number;
    email: string;
    role: string;
  };
  token: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResult> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw Object.assign(new Error('Invalid email or password'), {
        statusCode: 401,
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw Object.assign(new Error('Invalid email or password'), {
        statusCode: 401,
      });
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn } as jwt.SignOptions
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
    };
  },
};
