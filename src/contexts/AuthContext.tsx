
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';

export type UserRole = 'candidate' | 'recruiter' | 'admin';

interface AuthUser extends Omit<User, 'role'> {
  role?: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  register: (email: string, password: string, role: UserRole) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<void>;
  loginDemo: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Updated demo users with more realistic credentials
const DEMO_USERS = {
  candidate: { email: 'demo.candidate@jobportal.com', password: 'DemoPass123!' },
  recruiter: { email: 'demo.recruiter@jobportal.com', password: 'DemoPass123!' },
  admin: { email: 'demo.admin@jobportal.com', password: 'DemoPass123!' }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string): Promise<UserRole | null> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      return data?.role as UserRole || null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  };

  const updateUserWithRole = async (currentUser: User, currentSession: Session) => {
    const role = await fetchUserRole(currentUser.id);
    const userWithRole: AuthUser = { ...currentUser, role };
    
    setUser(userWithRole);
    setSession(currentSession);
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (initialSession?.user) {
          await updateUserWithRole(initialSession.user, initialSession);
        } else {
          setUser(null);
          setSession(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      }
    };

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !currentSession?.user) {
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const userWithRole: AuthUser = { ...currentSession.user, role: undefined };
          setUser(userWithRole);
          setSession(currentSession);
          setLoading(false);
          
          // Fetch role in background
          setTimeout(async () => {
            if (mounted) {
              await updateUserWithRole(currentSession.user, currentSession);
            }
          }, 0);
        }
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      toast.error('Login failed');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { role }
        }
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success('Registration successful! Please check your email to confirm your account.');
      return { error: null };
    } catch (error: any) {
      toast.error('Registration failed');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Logout failed');
        throw error;
      }
      
      setUser(null);
      setSession(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const loginDemo = async (role: UserRole) => {
    const demoUser = DEMO_USERS[role];
    if (!demoUser) {
      toast.error('Demo user not found');
      return;
    }

    setLoading(true);
    try {
      console.log(`Attempting demo login for ${role} with email: ${demoUser.email}`);
      
      // First try to sign in with existing credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: demoUser.email,
        password: demoUser.password,
      });

      if (!signInError) {
        toast.success(`Logged in as demo ${role}`);
        return;
      }

      // If sign in fails, try to create the demo user first
      console.log(`Demo user doesn't exist, creating demo ${role} user...`);
      
      const { error: signUpError } = await supabase.auth.signUp({
        email: demoUser.email,
        password: demoUser.password,
        options: {
          data: { role }
        }
      });

      if (signUpError) {
        console.error('Demo user creation failed:', signUpError);
        
        // If user already exists but with different password, show helpful message
        if (signUpError.message.includes('already registered')) {
          toast.error(`Demo ${role} account exists but credentials don't match. Please use regular login or contact support.`);
        } else {
          toast.error(`Failed to create demo ${role} account: ${signUpError.message}`);
        }
        return;
      }

      // Try to sign in again after creating the user
      const { error: secondSignInError } = await supabase.auth.signInWithPassword({
        email: demoUser.email,
        password: demoUser.password,
      });

      if (secondSignInError) {
        toast.error(`Demo login failed after account creation: ${secondSignInError.message}`);
        return;
      }

      toast.success(`Demo ${role} account created and logged in successfully!`);

    } catch (error: any) {
      console.error('Demo login error:', error);
      toast.error(`Demo login failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
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
      loginDemo,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
