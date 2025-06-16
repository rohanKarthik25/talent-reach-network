
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          // Check if user is admin
          const isAdmin = session.user.email === 'rohankarthik402@gmail.com';
          
          if (isAdmin) {
            // Handle admin user
            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              role: 'admin',
              created_at: session.user.created_at || new Date().toISOString(),
            };
            setUser(userData);
            
            // Ensure admin role exists in database
            const { error: roleError } = await supabase
              .from('user_roles')
              .upsert({
                user_id: session.user.id,
                role: 'admin'
              });
            
            if (roleError) {
              console.error('Error setting admin role:', roleError);
            }
          } else {
            // Fetch user role from user_roles table for non-admin users
            const { data: userRole, error } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .single();

            if (error && error.code !== 'PGRST116') {
              console.error('Error fetching user role:', error);
            }

            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              role: userRole?.role || 'candidate',
              created_at: session.user.created_at || new Date().toISOString(),
            };
            
            setUser(userData);
          }
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // The onAuthStateChange handler will be called automatically
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast.error(error.message);
        throw error;
      }

      toast.success('Logged in successfully!');
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/login`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: role
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        toast.error(error.message);
        throw error;
      }

      if (data.user && !data.session) {
        toast.success('Please check your email to confirm your account!');
        // Redirect to login page after registration
        window.location.href = '/login';
      } else {
        toast.success('Account created successfully!');
        // If session exists, redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.error(error.message);
      } else {
        toast.success('Logged out successfully!');
        window.location.href = '/login';
      }
    } catch (error: any) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
