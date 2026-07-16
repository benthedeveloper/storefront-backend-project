import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { User } from '../models/user.ts';

// Extend Express Request interface to include user data
export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Throws an error synchronously if the token is invalid or expired
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string);

    const payload = decoded as jwt.JwtPayload;

    req.user = {
      id: Number(payload.sub ?? 0),
      username: typeof payload.username === 'string' ? payload.username : '',
      firstName: '',
      lastName: '',
    };
    next();
  } catch (error) {
    console.error('authenticateToken error:', error);

    // Distinguish between a bad token (403) and a server crash (500)
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }

    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
