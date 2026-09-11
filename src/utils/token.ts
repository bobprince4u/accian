import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

// Updated to include all required fields
export const generateAccessToken = (payload: {
  id: string;
  email: string;
  role: string;
}) => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_ACCESS_SECRET not defined");
  return jwt.sign(payload, secret, { expiresIn: "15m" });
};

/**
 * Refresh tokens are stored in `refresh_tokens` and revoked *by their string
 * value*, so every issued token must be a distinct string.
 *
 * Without the `jti`, the payload is just `{id}` and `iat` has one-second
 * resolution: two refresh tokens minted for the same user within the same
 * second were byte-identical. Rotation then revoked the old token and handed
 * back the same string, so the row it had just revoked and the row it inserted
 * carried identical values — a stolen token survived the rotation that was
 * meant to invalidate it. The `jti` makes each token unique.
 */
export const generateRefreshToken = (payload: { id: string }) => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET not defined");
  return jwt.sign(payload, secret, {
    expiresIn: "7d",
    jwtid: randomUUID(),
  });
};
