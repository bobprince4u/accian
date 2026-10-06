const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

if (process.env.NODE_ENV === "production" && !configuredApiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL must be set for production builds.");
}

export const API_URL = configuredApiUrl || "http://localhost:2025";
