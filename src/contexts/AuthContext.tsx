
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { supabase } from '../integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
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
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        
        if (session?.user) {
          // Convert Supabase user to our User type
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            role: 'candidate', // Default role, will be updated from user_roles table
            created_at: session.user.created_at || new Date().toISOString(),
          };
          setUser(userData);
          
          // Fetch user role from user_roles table
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          role: 'candidate',
          created_at: session.user.created_at || new Date().toISOString(),
        };
        setUser(userData);
        
        // Fetch user role
        setTimeout(() => {
          fetchUserRole(session.user.id);
        }, 0);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      if (data && user) {
        setUser(prev => prev ? { ...prev, role: data.role as UserRole } : null);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      console.log('Login successful:', data);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: role // Store role in user metadata
          }
        }
      });

      if (error) {
        throw error;
      }

      console.log('Registration successful:', data);

      // If user is immediately available (email confirmation disabled), 
      // update the user_roles table with the selected role
      if (data.user && !data.user.email_confirmed_at) {
        console.log('Updating user role to:', role);
        
        // Update the user_roles table with the selected role
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: role })
          .eq('user_id', data.user.id);

        if (roleError) {
          console.error('Error updating user role:', roleError);
        }

        // Also create appropriate profile based on role
        if (role === 'recruiter') {
          const { error: recruiterError } = await supabase
            .from('recruiters')
            .insert({
              user_id: data.user.id,
              company_name: 'New Company'
            });

          if (recruiterError) {
            console.error('Error creating recruiter profile:', recruiterError);
          }
        }
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    supabase.auth.signOut().then(() => {
      setUser(null);
      setSession(null);
      navigate('/login', { replace: true });
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
