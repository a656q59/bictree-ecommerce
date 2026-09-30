import { ApiError } from "../../errors/api-error.ts";
import { apiClient } from "../api/client.ts";
import { normalizeAuthSession } from "../auth/normalize-auth.ts";
import type { AuthCredentials, AuthSession } from "../../types/auth.ts";

export async function login(credentials: AuthCredentials): Promise<AuthSession> {
  const { data } = await apiClient.post<unknown>("/api/auth/login", credentials);
  return normalizeAuthSession(data, credentials.email);
}

export async function register(
  credentials: AuthCredentials & { confirmPassword: string },
): Promise<AuthSession | null> {
  const { data } = await apiClient.post<unknown>("/api/auth/register", credentials);

  try {
    return normalizeAuthSession(data, credentials.email);
  } catch (error) {
    if (error instanceof ApiError && error.code === "INVALID_RESPONSE") {
      return null;
    }
    throw error;
  }
}
