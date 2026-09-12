import { apiClient, clearSession, getRefreshToken, storeSession } from "./apiClient";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserPayload {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  fullName: string;
  username: string;
}

/**
 * POST /api/admin/login → { success, message, data: { accessToken, refreshToken, user } }
 *
 * Both tokens are stored. Storing only the access token — which is what the
 * login form used to do — left the app unable to refresh, so every session
 * died after 15 minutes and looked to the user like a random logout.
 */
export const adminLogin = async (payload: LoginPayload): Promise<UserPayload> => {
  const response = await apiClient.post("/login", payload);
  const data = response.data?.data ?? {};

  storeSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user,
  });

  return data.user as UserPayload;
};

/**
 * POST /api/admin/create → { success, message, data: <admin row> }
 *
 * Deliberately returns no tokens: the endpoint creates the bootstrap account
 * and does not sign it in. The caller must send the user to the login form.
 */
export const adminSignup = async (payload: SignupPayload): Promise<void> => {
  await apiClient.post("/create", payload);
};

/**
 * Revokes the refresh token server-side, then clears local state.
 *
 * The local clear runs even when the request fails: the user asked to be
 * logged out, so the browser must forget the session regardless of whether the
 * server could be reached. The access token remains valid until it expires
 * (max 15 minutes) — inherent to stateless JWTs.
 */
export const adminLogout = async (): Promise<void> => {
  const refreshToken = getRefreshToken();

  if (refreshToken) {
    try {
      await apiClient.post("/logout", { refreshToken });
    } catch {
      // Revocation failed (offline, server down). Nothing useful to log, and
      // the local session must be cleared either way.
    }
  }

  clearSession();
};
