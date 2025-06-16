
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
            
            // Ensure admin role exists in database (don't wait for response)
            setTimeout(() => {
              supabase
                .from('user_roles')
                .upsert({
                  user_id: session.user.id,
                  role: 'admin'
                })
                .then(({ error }) => {
                  if (error) {
                    console.log('Note: Could not set admin role in database:', error.message);
                  }
                });
            }, 0);
          } else {
            // Fetch user role from user_roles table for non-admin users
            let userRole: UserRole = 'candidate'; // Default fallback
            
            try {
              const { data: userRoleData, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .maybeSingle();

              if (!error && userRoleData?.role) {
                userRole = userRoleData.role as UserRole;
              } else {
                // If no role found, create a default one
                console.log('No role found, creating default candidate role');
                const { error: insertError } = await supabase
                  .from('user_roles')
                  .insert({
                    user_id: session.user.id,
                    role: 'candidate'
                  });
                
                if (insertError) {
                  console.log('Could not create default role:', insertError.message);
                }
              }
            } catch (roleError) {
              console.log('Error fetching user role:', roleError);
            }

            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              role: userRole,
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
