'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '../supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isDemoMode: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 'usr_demo_siya_pahwa',
  app_metadata: { provider: 'email' },
  user_metadata: { full_name: 'Siya Pahwa' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'siya.pahwa@finfly.ai',
  phone: '',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

const DEMO_PROFILE: UserProfile = {
  id: 'usr_demo_siya_pahwa',
  email: 'siya.pahwa@finfly.ai',
  fullName: 'Siya Pahwa',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const configured = isSupabaseConfigured();
    const isProduction = process.env.NODE_ENV === 'production';

    if (configured && supabase) {
      // Production or active Supabase environment
      setIsDemoMode(false);
      
      // Get initial session
      supabase.auth.getSession().then(({ data: { session: initialSession }, error: sessionError }) => {
        if (sessionError) {
          setError(sessionError.message);
        } else if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          setProfile({
            id: initialSession.user.id,
            email: initialSession.user.email || '',
            fullName: initialSession.user.user_metadata?.full_name || initialSession.user.email?.split('@')[0] || 'User',
          });
        }
        setIsLoading(false);
      });

      // Listen to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        if (newSession?.user) {
          setProfile({
            id: newSession.user.id,
            email: newSession.user.email || '',
            fullName: newSession.user.user_metadata?.full_name || newSession.user.email?.split('@')[0] || 'User',
          });
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Unconfigured environment
      if (isProduction) {
        // SECURITY: Never create fake authenticated user in production
        setUser(null);
        setProfile(null);
        setSession(null);
        setIsDemoMode(false);
        setError('Supabase authentication is not configured for this production deployment.');
      } else {
        // Development / Demo Fallback Mode
        const storedDemoSession = localStorage.getItem('finfly_demo_auth');
        const isLoggedOut = storedDemoSession === 'logged_out';

        if (!isLoggedOut) {
          setUser(DEMO_USER);
          setProfile(DEMO_PROFILE);
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsDemoMode(true);
      }
      setIsLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    const supabase = getSupabaseBrowserClient();

    if (isSupabaseConfigured() && supabase) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        setUser(authData.user);
        setSession(authData.session);
        setProfile({
          id: authData.user.id,
          email: authData.user.email || '',
          fullName: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'User',
        });
      }
      return { success: true };
    }

    if (process.env.NODE_ENV === 'production') {
      const msg = 'Production authentication is unavailable. Please configure NEXT_PUBLIC_SUPABASE_URL.';
      setError(msg);
      return { success: false, error: msg };
    }

    // Development demo sign-in
    localStorage.removeItem('finfly_demo_auth');
    setUser(DEMO_USER);
    setProfile(DEMO_PROFILE);
    return { success: true };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string = ''
  ): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    const supabase = getSupabaseBrowserClient();

    if (isSupabaseConfigured() && supabase) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        setUser(authData.user);
        setSession(authData.session);
        setProfile({
          id: authData.user.id,
          email: authData.user.email || '',
          fullName: fullName || authData.user.email?.split('@')[0] || 'User',
        });
      }
      return { success: true };
    }

    if (process.env.NODE_ENV === 'production') {
      const msg = 'Production registration is unavailable. Please configure NEXT_PUBLIC_SUPABASE_URL.';
      setError(msg);
      return { success: false, error: msg };
    }

    // Development demo sign-up
    localStorage.removeItem('finfly_demo_auth');
    const demoUser: User = {
      ...DEMO_USER,
      email,
      user_metadata: { full_name: fullName || 'Demo User' },
    };
    setUser(demoUser);
    setProfile({ id: demoUser.id, email, fullName: fullName || 'Demo User' });
    return { success: true };
  };

  const signOut = async (): Promise<void> => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    if (isDemoMode) {
      localStorage.setItem('finfly_demo_auth', 'logged_out');
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isDemoMode,
        error,
        signIn,
        signUp,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
