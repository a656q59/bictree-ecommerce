import { createContext } from "react";

import type { AuthUser } from "../../types/auth.ts";

export type AuthContextValue = {
  user: AuthUser | null;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
