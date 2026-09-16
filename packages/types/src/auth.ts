/**
 * Authentication contract.
 *
 * Tokens are opaque strings to every client. Nothing here describes their
 * internals: no claims, no expiry arithmetic, no signing details. Those are
 * the API's business, and a client that started depending on them would break
 * the moment the API changed how it issues them.
 *
 * `password_hash` is never part of any shape in this file.
 */

/** The authenticated administrator, as returned on login. */
export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

/** Body accepted by `POST /api/admin/login`. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Payload inside the success envelope of `POST /api/admin/login`. */
export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

/** Body accepted by `POST /api/admin/refresh`. */
export interface RefreshRequest {
  refreshToken: string;
}

/**
 * Payload inside the success envelope of `POST /api/admin/refresh`.
 *
 * Refresh rotates: the presented token is spent and a new pair is issued.
 */
export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}
