import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Log error in development
  if (isDevelopment) {
    console.error('[Error]', {
      message: err.message,
      stack: err.stack,
      statusCode,
    });
  } else if (statusCode >= 500) {
    // Log server errors in production (without sensitive details)
    console.error('[Server Error]', { statusCode, message: err.message });
  }

  // Don't expose internal errors to client
  const clientMessage =
    statusCode >= 500 && !isDevelopment
      ? 'Internal server error'
      : err.message || 'Something went wrong';

  res.status(statusCode).json({
    error: clientMessage,
    ...(isDevelopment && statusCode >= 500 && { stack: err.stack }),
  });
};

export const createError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
