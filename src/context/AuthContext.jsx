import React, { createContext, useContext, useState, useMemo } from "react";

/**
 * Auth Context — STUB for future authentication.
 *
 * Currently provides a mock user.
 * When you add a real auth provider (Firebase, Supabase, Auth0, etc.),
 * replace the mock with actual auth state.
 *
 * Usage:
 *   <AuthProvider>
 *     <App />
 *   </AuthProvider>
 *
 *   const { user, isAuthenticated } = useAuth();
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Future: replace with real auth state
  const [user] = useState({
    id: "local-user",
    nombre: "Usuario BodyLogic",
    rol: "distribuidor", // "distribuidor" | "clientePreferente" | "admin"
    authenticated: false,
  });

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user.authenticated,
      // Future methods:
      // login: async (email, password) => { ... },
      // logout: async () => { ... },
      // signup: async (data) => { ... },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
