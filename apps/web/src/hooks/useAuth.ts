import { useEffect, useState } from 'react';
import { request, getToken, setToken } from '../api/client';
import type { User } from '../api/auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth(): AuthState & { signOut: () => void } {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setState({ user: null, loading: false });
      return;
    }
    let cancelled = false;
    // Exchange the stored token for the real user. A stale/invalid token
    // (e.g. after the server reseeded) clears auth and drops back to login.
    request<User>('/auth/me')
      .then((user) => {
        if (!cancelled) setState({ user, loading: false });
      })
      .catch(() => {
        if (!cancelled) {
          setToken(null);
          setState({ user: null, loading: false });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function signOut() {
    setToken(null);
    setState({ user: null, loading: false });
  }

  return { ...state, signOut };
}
