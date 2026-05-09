"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { FILiteUser, loadUser, clearUser } from "../app/lib/auth";

interface AuthCtx {
  user: FILiteUser | null;
  setUser: (u: FILiteUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({ user: null, setUser: () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FILiteUser | null>(null);

  useEffect(() => {
    setUser(loadUser());
  }, []);

  const logout = () => {
    clearUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
