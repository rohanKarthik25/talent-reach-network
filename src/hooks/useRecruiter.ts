
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface RecruiterProfile {
  id: string;
  user_id: string;
  company_name: string;
  industry?: string;
  description?: string;
  location?: string;
  logo_url?: string;
}

export const useRecruiter = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('recruiters')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching recruiter profile:', error);
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // Create profile if it doesn't exist
        await createProfile();
      }
    } catch (error) {
      console.error('Error fetching recruiter profile:', error);
      toast.error('Failed to load company profile');
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('recruiters')
        .insert({
          user_id: user.id,
          company_name: 'New Company'
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      toast.success('Company profile created successfully');
    } catch (error) {
      console.error('Error creating recruiter profile:', error);
      toast.error('Failed to create company profile');
    }
  };

  const updateProfile = async (updates: Partial<RecruiterProfile>) => {
    if (!user) return;
    
    try {
      console.log('Updating recruiter profile with:', updates);
      
      const { data, error } = await supabase
        .from('recruiters')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log('Recruiter profile updated successfully:', data);
      setProfile(data);
      toast.success('Company profile updated successfully');
    } catch (error) {
      console.error('Error updating recruiter profile:', error);
      toast.error(`Failed to update company profile: ${error.message}`);
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile
  };
};
