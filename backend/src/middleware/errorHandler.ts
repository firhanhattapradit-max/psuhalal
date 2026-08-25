import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

export class AppError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(message: string, status: number, code: string = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let status = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';
  let details = undefined;

  if (err instanceof AppError) {
    status = err.status;
    message = err.message;
    code = err.code;
    details = err.details;
  } else if (err.isJoi || err.name === 'ValidationError') {
    status = 400;
    message = 'Validation Error';
    code = 'VALIDATION_ERROR';
    details = err.details || err.message;
  } else if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  } else if (err.code === '23505') {
    status = 409;
    message = 'Duplicate record exists';
    code = 'UNIQUE_CONSTRAINT_VIOLATION';
    details = err.detail;
  } else if (err.code === '23503') {
    status = 400;
    message = 'Referenced record does not exist';
    code = 'FOREIGN_KEY_VIOLATION';
    details = err.detail;
  }

  if (status >= 500) {
    logger.error({ message: err.message || message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, path: req.path, method: req.method });
  } else {
    logger.warn({ message: err.message || message, path: req.path, method: req.method });
  }

  const response: { success: false; error: ApiError } = {
    success: false,
    error: {
      message,
      code,
      details
    }
  };

  res.status(status).json(response);
};
