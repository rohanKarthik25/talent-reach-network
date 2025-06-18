
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import { Button } from '../ui/button';
import { User, LogOut, Briefcase } from 'lucide-react';
import { UserRole } from '../../types';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserRole();
    }
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      setUserRole(data.role);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-primary">JobPortal</span>
            </div>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{user.email}</span>
                {userRole && (
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                    {userRole}
                  </span>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
