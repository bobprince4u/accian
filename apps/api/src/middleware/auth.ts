import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// JWT Token Payload (what goes IN the token - minimal)
interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

// User Payload (what the app uses - includes all user info)
export interface UserPayload {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

// Extend Express Request interface
declare module "express-serve-static-core" {
  interface Request {
    user?: TokenPayload;
  }
}

/**
 * Verifies the access token.
 *
 * Status codes are meaningful and clients depend on the distinction:
 *   401 — no token, malformed token, or an expired/invalid one. The client
 *         should attempt a refresh and only then send the user to login.
 *   403 — the token is valid but the identity is not allowed here
 *         (see `requireAdmin`).
 *
 * Nothing about the decoded token is logged: it carries the admin's email.
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    // Misconfiguration, not a client error.
    console.error("❌ JWT_ACCESS_SECRET is not set");
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(token, secret) as Partial<TokenPayload>;

    if (!decoded.id || !decoded.email) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = decoded as TokenPayload;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res
        .status(401)
        .json({ message: "Access token expired", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * Authorisation, kept separate from authentication so the status codes stay
 * meaningful: a valid token belonging to a non-admin is 403, not 401.
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};

/*
 * `generateToken` used to live here. It signed a 10-hour token with
 * `JWT_SECRET`, but `authenticateToken` verifies against `JWT_ACCESS_SECRET`,
 * so a token it produced could never have authenticated a request. Nothing
 * imported it. It is removed rather than wired up because the intended design
 * is the 15-minute access token from `utils/token.ts` plus a refresh token,
 * and reviving a 10-hour path would weaken that. `JWT_SECRET` is likewise no
 * longer read anywhere in the source.
 */

