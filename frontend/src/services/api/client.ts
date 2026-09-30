import axios, { type InternalAxiosRequestConfig } from "axios";

import { appConfig } from "../../app/config/env.ts";
import { reportError } from "../../errors/logger.ts";
import { normalizeApiError } from "../../errors/normalize-api-error.ts";

const AUTH_ATTEMPT = /\/api\/auth\/(login|register)\/?$/;

let readAccessToken: () => string | null = () => null;
let onUnauthorized: () => void = () => {};

export function setAccessTokenReader(reader: () => string | null): void {
  readAccessToken = reader;
}

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

function isAuthAttempt(config: InternalAxiosRequestConfig | undefined): boolean {
  const url = config?.url ?? "";
  return AUTH_ATTEMPT.test(url);
}

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 15_000,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  config.headers.set("Accept", "application/json");

  const token = readAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  if (!config.headers.has("X-Request-Id")) {
    config.headers.set("X-Request-Id", crypto.randomUUID());
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = normalizeApiError(error);

    if (apiError.code !== "CANCELLED") {
      reportError("api", apiError);
    }

    if (
      apiError.status === 401 &&
      axios.isAxiosError(error) &&
      !isAuthAttempt(error.config)
    ) {
      onUnauthorized();
    }

    return Promise.reject(apiError);
  },
);
