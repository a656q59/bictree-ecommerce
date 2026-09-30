export function safeRedirect(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/login")) {
    return null;
  }

  return value;
}
