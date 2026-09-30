import { setAccessTokenReader, setUnauthorizedHandler } from "../api/client.ts";
import type { AuthUser } from "../../types/auth.ts";

const TOKEN_KEY = "megamart.token";
const USER_KEY = "megamart.user";

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getSessionUser(): AuthUser | null {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || !("email" in parsed)) {
      return null;
    }
    const email = parsed.email;
    const id = "id" in parsed ? parsed.id : email;
    if (typeof email !== "string" || typeof id !== "string") {
      return null;
    }
    return { id, email };
  } catch {
    return null;
  }
}

export function saveSession(accessToken: string, user: AuthUser): void {
  sessionStorage.setItem(TOKEN_KEY, accessToken);
  sessionStorage.setItem(USER_KEY, JSON.stringify({ id: user.id, email: user.email }));
  emit();
}

export function clearSession(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  emit();
}

setAccessTokenReader(getAccessToken);
setUnauthorizedHandler(() => {
  clearSession();
});
