import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";

import { queryKeys } from "../../query/keys.ts";
import { clearSession, getSessionUser, subscribeSession } from "../../services/auth/session.ts";
import type { AuthUser } from "../../types/auth.ts";
import { AuthContext } from "./auth-context.ts";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getSessionUser());
  const queryClient = useQueryClient();

  useEffect(() => subscribeSession(() => setUser(getSessionUser())), []);

  function signOut() {
    clearSession();
    queryClient.removeQueries({ queryKey: queryKeys.cart });
  }

  return <AuthContext.Provider value={{ user, signOut }}>{children}</AuthContext.Provider>;
}
