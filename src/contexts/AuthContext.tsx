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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        // For admin dashboard, we'll just create a basic profile if user is admin
        if (session.user.email === 'admin@onolo.com') {
          setProfile({
            id: session.user.id,
            first_name: 'Admin',
            last_name: 'User',
            phone: null,
            address: null,
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            default_delivery_window: null,
            default_latitude: null,
            default_longitude: null,
          });
        } else {
          // For non-admin users, deny access
          toast.error('Access denied. Admin privileges required.');
          await supabase.auth.signOut();
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Auth initialization error:', error);
      setLoading(false);
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user?.email === 'admin@onolo.com') {
          setProfile({
            id: session.user.id,
            first_name: 'Admin',
            last_name: 'User',
            phone: null,
            address: null,
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            default_delivery_window: null,
            default_latitude: null,
            default_longitude: null,
          });
        } else {
          setProfile(null);
          if (session?.user) {
            toast.error('Access denied. Admin privileges required.');
            await supabase.auth.signOut();
          }
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