
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: 'patient' | 'dentist' | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, role: 'patient' | 'dentist', firstName: string, lastName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'patient' | 'dentist' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Determine user role based on email domain or user metadata
          const email = session.user.email;
          if (email?.includes('@dentalclinic.com')) {
            setUserRole('dentist');
          } else {
            setUserRole('patient');
          }
        } else {
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const email = session.user.email;
        if (email?.includes('@dentalclinic.com')) {
          setUserRole('dentist');
        } else {
          setUserRole('patient');
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, role: 'patient' | 'dentist', firstName: string, lastName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role
        }
      }
    });

    if (!error && role === 'patient') {
      // Create patient record
      await supabase.from('patients').insert([{
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: '' // Will be updated later
      }]);
    } else if (!error && role === 'dentist') {
      // Create dentist record
      await supabase.from('dentists').insert([{
        first_name: firstName,
        last_name: lastName,
        email: email
      }]);
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userRole,
      signIn,
      signUp,
      signOut,
      loading
    }}>
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
