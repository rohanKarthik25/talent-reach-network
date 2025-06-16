
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
          // Check if user is admin by email
          const isAdmin = session.user.email === 'rohankarthik402@gmail.com';
          
          if (isAdmin) {
            // Handle admin user - create immediately without database lookup
            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              role: 'admin',
              created_at: session.user.created_at || new Date().toISOString(),
            };
            setUser(userData);
            console.log('Admin user authenticated:', userData);
          } else {
            // For non-admin users, fetch role from database with timeout
            let userRole: UserRole = 'candidate'; // Default fallback
            
            try {
              // Add timeout to prevent hanging
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
              
              const { data: userRoleData, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .maybeSingle()
                .abortSignal(controller.signal);

              clearTimeout(timeoutId);

              if (!error && userRoleData?.role) {
                userRole = userRoleData.role as UserRole;
                console.log('Found user role:', userRole);
              } else {
                console.log('No role found or error, using default candidate role');
              }
            } catch (roleError) {
              console.log('Error fetching user role (using default):', roleError);
            }

            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              role: userRole,
              created_at: session.user.created_at || new Date().toISOString(),
            };
            
            setUser(userData);
            console.log('User authenticated:', userData);
          }
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setLoading(false);
      }
      // The onAuthStateChange handler will be called automatically for existing sessions
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast.error(error.message || 'Login failed');
        throw error;
      }

      if (data.user) {
        console.log('Login successful for:', email);
        toast.success('Logged in successfully!');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed');
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
        toast.error(error.message || 'Registration failed');
        throw error;
      }

      if (data.user && !data.session) {
        toast.success('Please check your email to confirm your account!');
        // Always redirect to login page after registration
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      } else if (data.session) {
        toast.success('Account created successfully!');
        // If session exists immediately, redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast.error(error.message || 'Registration failed');
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
        toast.error(error.message || 'Logout failed');
      } else {
        toast.success('Logged out successfully!');
        window.location.href = '/login';
      }
    } catch (error: any) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
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
