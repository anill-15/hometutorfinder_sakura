import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { seedDemoData, resetDemoData } from '../utils/seedData.js';
import * as authService from '../services/authService.js';

/**
 * AuthContext holds the signed-in user for the whole app.
 *
 * Everything is read from localStorage on mount, so a page refresh keeps you
 * signed in and any change made by a service (profile edits, verification,
 * new reviews) shows up after the `refresh()` call.
 */
const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  // Seed on first launch so the app is usable immediately. This runs as a lazy
  // state initialiser, which is guaranteed to happen exactly once per mount and
  // never during a re-render.
  const [, setSeeded] = useState(() => seedDemoData());

  const [user, setUser] = useState(() => authService.getCurrentUser());

  // Keep tabs in sync (useful when opening two tabs during a demo).
  useEffect(() => {
    const onStorage = (event) => {
      if (!event.key || event.key.includes('currentUser')) setUser(authService.getCurrentUser());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = (credentials) => {
    const result = authService.login(credentials);
    if (result.ok) setUser(result.user);
    return result;
  };

  const register = (payload) => {
    const result = authService.register(payload);
    if (result.ok) setUser(result.user);
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  /** Re-reads the user from storage (after a profile update, for example). */
  const refresh = () => setUser(authService.getCurrentUser());

  /**
   * Wipes every key this app owns and restores the original demo dataset.
   * The caller is signed out, so the next page load starts from a clean state.
   */
  const resetDemo = () => {
    resetDemoData();
    setUser(null);
    setSeeded((n) => n + 1);
  };

  const value = useMemo(
    () => ({ user, login, register, logout, refresh, resetDemo, isAuthenticated: !!user }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the auth state. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

export { authService };
export default AuthContext;