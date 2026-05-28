import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: number;
    role?: string;
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'missing token' });
    return;
  }
  try {
    const { userId, role } = verifyToken(header.slice(7));
    req.userId = userId;
    req.role = role;
    next();
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
}
