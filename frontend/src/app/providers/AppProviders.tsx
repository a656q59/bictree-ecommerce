import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { ErrorBoundary } from "../../components/common/ErrorBoundary.tsx";
import { AuthProvider } from "../../features/auth/AuthProvider.tsx";
import { queryClient } from "./query-client.ts";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
