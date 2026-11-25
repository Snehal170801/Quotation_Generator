import { Request, Response, NextFunction } from 'express';

// Admin-only routes (e.g. manage categories, manage sales users)
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  next();
};

// Routes both admin + sales can hit (e.g. sales panel, orders, customers)
export const isSales = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'sales') {
    return res.status(403).json({ message: 'Access denied.' });
  }

  next();
};