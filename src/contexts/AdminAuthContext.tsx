'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import { AdminUser } from '@/types/admin';

interface AdminAuthContextValue {
  admin: AdminUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { admin } = await apiFetch<{ admin: AdminUser }>('/api/admin/auth/me');
      setAdmin(admin);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setAdmin(null);
      } else {
        console.error('Failed to fetch admin auth state:', err);
        setAdmin(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- マウント時の初回フェッチ
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await apiFetch('/api/admin/auth/logout', { method: 'POST' });
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, loading, refresh, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
}
