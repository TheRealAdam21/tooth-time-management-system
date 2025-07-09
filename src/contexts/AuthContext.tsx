
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

  const determineUserRole = async (userId: string): Promise<'dentist' | null> => {
    try {
      console.log('Determining user role for:', userId);
      
      // Check if user exists in dentists table using user_id
      const { data: dentistData, error } = await supabase
        .from('dentists')
        .select('id, email, first_name, last_name, user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking dentist role:', error);
        return null;
      }

      if (dentistData) {
        console.log('User is a dentist:', dentistData);
        return 'dentist';
      } else {
        console.log('User not found by user_id. Checking by email...');
        
        // Get current user email
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user?.email) {
          console.log('No user email found');
          return null;
        }

        // Check if there's an existing dentist record with this email but no user_id
        const { data: existingDentist, error: emailError } = await supabase
          .from('dentists')
          .select('id, email, first_name, last_name, user_id')
          .eq('email', userData.user.email)
          .maybeSingle();

        if (emailError) {
          console.error('Error checking dentist by email:', emailError);
          return null;
        }

        if (existingDentist) {
          console.log('Found existing dentist record by email:', existingDentist);
          
          // Update the existing record with the user_id
          const { data: updatedDentist, error: updateError } = await supabase
            .from('dentists')
            .update({ user_id: userId })
            .eq('id', existingDentist.id)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating dentist record:', updateError);
            return null;
          }

          console.log('Successfully updated dentist record with user_id:', updatedDentist);
          return 'dentist';
        } else {
          console.log('No existing dentist record found. Creating new one...');
          
          // Create new dentist record
          const { data: newDentist, error: createError } = await supabase
            .from('dentists')
            .insert({
              user_id: userId,
              email: userData.user.email,
              first_name: userData.user.user_metadata?.first_name || 'Dr.',
              last_name: userData.user.user_metadata?.last_name || 'Dentist'
            })
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating dentist record:', createError);
            return null;
          }
          
          console.log('Successfully created dentist record:', newDentist);
          return 'dentist';
        }
      }
    } catch (error) {
      console.error('Error in determineUserRole:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer role determination to prevent deadlocks
          setTimeout(async () => {
            const role = await determineUserRole(session.user.id);
            setUserRole(role);
            setLoading(false);
          }, 100);
        } else {
          setUserRole(null);
          setLoading(false);
        }
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
          const role = await determineUserRole(session.user.id);
          setUserRole(role);
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
