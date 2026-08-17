'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserProfileDB, UserPlan } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfileDB | null;
  plan: UserPlan;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  setMockUserForDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfileDB | null>(null);
  const [plan, setPlan] = useState<UserPlan>('free');
  const [loading, setLoading] = useState<boolean>(true);
  const [isConfigured] = useState<boolean>(isSupabaseConfigured());

  const fetchProfile = useCallback(async (currentUserId: string, token?: string) => {
    if (!isConfigured) {
      // Local fallback profile
      const localProfileStr = localStorage.getItem('strapy_ats_user_profile_v2');
      if (localProfileStr) {
        try {
          const parsed = JSON.parse(localProfileStr);
          setProfile(parsed);
          setPlan(parsed.plan || 'free');
          return;
        } catch {
          // ignore
        }
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .single();

      if (data && !error) {
        setProfile(data as UserProfileDB);
        setPlan((data.plan as UserPlan) || 'free');
      } else if (error && error.code === 'PGRST116') {
        // Record doesn't exist yet, try to create it
        const newProfile: Partial<UserProfileDB> = {
          id: currentUserId,
          full_name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
          email: user?.email || '',
          plan: 'free',
        };
        const { data: inserted } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (inserted) {
          setProfile(inserted as UserProfileDB);
          setPlan('free');
        }
      }
    } catch (err) {
      console.warn('Could not fetch Supabase profile:', err);
    }
  }, [isConfigured, user]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      // 1. Check if mock demo session is active in localStorage
      const mockSession = localStorage.getItem('strapy_ats_demo_user');
      if (mockSession && !isConfigured) {
        try {
          const parsedUser = JSON.parse(mockSession);
          if (isMounted) {
            setUser(parsedUser);
            setPlan('free');
            setLoading(false);
          }
          return;
        } catch {
          localStorage.removeItem('strapy_ats_demo_user');
        }
      }

      if (!isConfigured) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Error fetching Supabase session:', error);
        }

        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            await fetchProfile(initialSession.user.id, initialSession.access_token);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    if (isConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, currentSession) => {
          if (!isMounted) return;
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          if (currentSession?.user) {
            await fetchProfile(currentSession.user.id, currentSession.access_token);
          } else {
            setProfile(null);
            setPlan('free');
          }
          setLoading(false);
        }
      );

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [isConfigured, fetchProfile]);

  const signInWithGoogle = async () => {
    if (!isConfigured) {
      // Demo / simulated login for local environment without Supabase keys
      const mockGoogleUser = {
        id: 'user-demo-uuid-1234',
        app_metadata: { provider: 'google', plan: 'free' },
        user_metadata: {
          full_name: 'Alex Desarrollador (Demo)',
          name: 'Alex Desarrollador',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          email: 'alex.dev@ejemplo.com',
        },
        email: 'alex.dev@ejemplo.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      localStorage.setItem('strapy_ats_demo_user', JSON.stringify(mockGoogleUser));
      setUser(mockGoogleUser);
      setProfile({
        id: 'user-demo-uuid-1234',
        full_name: 'Alex Desarrollador (Demo)',
        email: 'alex.dev@ejemplo.com',
        phone: '+56 9 8765 4321',
        national_id: '19.876.543-2',
        years_experience: 5,
        english_level: 'avanzado',
        expected_salary_amount: 2800000,
        expected_salary_currency: 'CLP',
        plan: 'free',
      });
      return;
    }

    const redirectUrl = `${window.location.origin}/auth/callback?next=/onboarding`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Error with Google Sign In:', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    localStorage.removeItem('strapy_ats_demo_user');
    if (isConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setPlan('free');
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, session?.access_token);
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    if (session?.access_token) return session.access_token;
    if (isConfigured) {
      const { data } = await supabase.auth.getSession();
      return data?.session?.access_token || null;
    }
    return 'demo-token-local';
  };

  const setMockUserForDemo = () => {
    signInWithGoogle();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        plan,
        loading,
        isConfigured,
        signInWithGoogle,
        signOut,
        refreshProfile,
        getAccessToken,
        setMockUserForDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
