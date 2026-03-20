import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { authService } from '../services/authService';

const COOKIE_NAME = 'token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours in ms
};

// Validation rules for login
export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1 })
    .withMessage('Password cannot be empty'),
];

export const authController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      // Set httpOnly cookie
      res.cookie(COOKIE_NAME, result.token, COOKIE_OPTIONS);

      res.status(200).json({
        message: 'Login successful',
        user: result.user,
      });
    } catch (err) {
      next(err);
    }
  },

  logout(_req: Request, res: Response): void {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  },

  me(req: Request, res: Response): void {
    // req.user is attached by verifyToken + requireAuth middleware
    res.status(200).json({ user: req.user });
  },
};
