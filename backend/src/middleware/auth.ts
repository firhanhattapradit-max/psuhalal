import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'passenger' | 'driver' | 'merchant' | 'admin';
        email: string;
        name: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-prod';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: { message: 'Authentication token required' } });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ success: false, error: { message: 'Invalid or expired token' } });
      return;
    }
    req.user = decoded as Express.Request['user'];
    next();
  });
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Authentication required' } });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: { message: 'Insufficient permissions' } });
      return;
    }

    next();
  };
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err) {
      req.user = decoded as Express.Request['user'];
    }
    next();
  });
};

export const socketAuthMiddleware = (socket: any, next: (err?: any) => void): void => {
  const token = socket.handshake.auth?.token;
  
  if (!token) {
    return next(new Error('Authentication error: Token required'));
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
    socket.user = decoded;
    next();
  });
};
