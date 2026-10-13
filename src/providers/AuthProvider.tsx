import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import type { Role } from '../types/auth';

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  role: Role | null;
  tenantId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. PRIMEIRO: registra o listener de mudanças de auth.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setLoading(false);
      if (event === 'SIGNED_OUT') {
        setSession(null);
      }
    });

    // 2. DEPOIS: busca a sessão inicial.
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      role: (session?.user.app_metadata?.role as Role) ?? null,
      tenantId: (session?.user.app_metadata?.tenant_id as string) ?? null,
      loading,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
      },
      signOut: async () => {
        try {
          await supabase.auth.signOut();
        } catch {
          // Ignora erro do servidor (ex.: 403 no logout global).
          // O Supabase já limpou a sessão local; seguimos com o estado zerado.
        }
        setSession(null);
        setLoading(false);
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext deve ser usado dentro de <AuthProvider>');
  return context;
}
