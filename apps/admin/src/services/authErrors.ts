/**
 * Turns a failed auth request into something safe to show a user.
 *
 * The backend deliberately returns an identical "Invalid credentials" message
 * for an unknown email and a wrong password, so it cannot be used to discover
 * which accounts exist. This helper preserves that: it surfaces the server's
 * own message and never adds detail of its own.
 */

import axios from "axios";

export const toAuthErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const serverMessage = (error.response?.data as { message?: string })
      ?.message;

    if (serverMessage) return serverMessage;

    // No response at all: the request never reached the API.
    if (!error.response) {
      return "Could not reach the server. Check your connection and try again.";
    }

    return "Authentication failed. Please try again.";
  }

  return "An unexpected error occurred. Please try again.";
};
