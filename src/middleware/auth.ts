import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { verifyToken, extractTokenFromHeader } from "../utils/auth.helper";
import { JWTPayload } from "../interfaces";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token using helper
    const authHeader = req.header("Authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    // Verify token using helper
    const decoded: JWTPayload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid token." });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Access denied." });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden. Insufficient permissions." });
    }

    next();
  };
};
