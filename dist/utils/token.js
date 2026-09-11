"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = require("crypto");
// Updated to include all required fields
const generateAccessToken = (payload) => {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret)
        throw new Error("JWT_ACCESS_SECRET not defined");
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: "15m" });
};
exports.generateAccessToken = generateAccessToken;
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
const generateRefreshToken = (payload) => {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret)
        throw new Error("JWT_REFRESH_SECRET not defined");
    return jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn: "7d",
        jwtid: (0, crypto_1.randomUUID)(),
    });
};
exports.generateRefreshToken = generateRefreshToken;
