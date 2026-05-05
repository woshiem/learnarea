"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getUser, login as authLogin, register as authRegister, logout as authLogout } from "@/lib/auth";
import type { User, AuthResult } from "@/lib/auth";

// ── Context Types ──────────────────────────────────────────────────────────

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedUser = getUser();
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const result = authLogin(email, password);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      const result = authRegister(name, email, password);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    },
    []
  );

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
