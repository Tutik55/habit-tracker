import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  const token =
    authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

  if (!token) {
    return res.status(401).json({
      message: "Authentication token is required."
    });
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({
      message: "JWT secret is not configured."
    });
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as {
      userId: number;
      email: string;
    };

    res.locals.userId = payload.userId;

    next();

  } catch {
    return res.status(401).json({
      message: "Invalid or expired token."
    });
  }
}