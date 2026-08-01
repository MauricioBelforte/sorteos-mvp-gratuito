import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './auth';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: 'Token inválido' });
    return;
  }
  
  req.userId = decoded.userId;
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  // En MVP, no implementamos roles admin
  next();
}
