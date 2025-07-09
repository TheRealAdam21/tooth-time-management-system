
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: 'dentist' | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'dentist' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Simply set role to dentist for any authenticated user
          setUserRole('dentist');
        } else {
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        console.log('Checking for existing session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        console.log('Existing session found:', !!session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Simply set role to dentist for any authenticated user
          setUserRole('dentist');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log('Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        setLoading(false);
        return { error };
      }

      console.log('Sign in successful, user:', data.user?.email);
      
      // The onAuthStateChange will handle the rest
      return { error: null };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      setLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserRole(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const contextValue = {
    user,
    session,
    userRole,
    signIn,
    signOut,
    loading
  };

  console.log('Auth context state:', { 
    hasUser: !!user, 
    userRole, 
    loading,
    userEmail: user?.email 
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
