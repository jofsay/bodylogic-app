import { createContext, useContext, useMemo } from 'react';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const value = useMemo(() => ({ user: { id: 'local-user', nombre: 'Usuario BodyLogic', rol: 'distribuidor', authenticated: false }, isAuthenticated: false }), []);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}