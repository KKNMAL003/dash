import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, type Profile } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        // Clear any invalid session
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        setUser(session.user);
        
        // Check if user has an admin profile in the database
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .eq('role', 'admin')
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
          // If profile doesn't exist or user is not admin, sign out
          toast.error('Access denied. Admin privileges required.');
          await supabase.auth.signOut();
        } else if (profileData && profileData.role === 'admin') {
          setProfile(profileData);
        } else {
          // For non-admin users, deny access
          toast.error('Access denied. Admin privileges required.');
          await supabase.auth.signOut();
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear any invalid session on error
      await supabase.auth.signOut();
      setLoading(false);
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        setUser(session.user);
        
        // Check if user has an admin profile in the database
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .eq('role', 'admin')
            .single();

          if (profileError) {
            console.error('Profile error in auth change:', profileError);
            setProfile(null);
            toast.error('Access denied. Admin privileges required.');
            await supabase.auth.signOut();
          } else if (profileData && profileData.role === 'admin') {
            setProfile(profileData);
          } else {
            setProfile(null);
            toast.error('Access denied. Admin privileges required.');
            await supabase.auth.signOut();
          }
        } catch (error) {
          console.error('Error checking profile in auth change:', error);
          setProfile(null);
          await supabase.auth.signOut();
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success('Signed in successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signOut,
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