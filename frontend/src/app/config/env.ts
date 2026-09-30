function requiredUrl(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`${name} is not set`);
  }

  return value.trim().replace(/\/$/, "");
}

export const appConfig = {
  apiBaseUrl: requiredUrl("VITE_API_BASE_URL", import.meta.env.VITE_API_BASE_URL),
};
