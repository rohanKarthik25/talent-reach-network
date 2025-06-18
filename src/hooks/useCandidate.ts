
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CandidateProfile {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  location?: string;
  education?: string;
  experience?: string;
  skills: string[];
  resume_url?: string;
  license_type?: string;
  license_number?: string;
}

export const useCandidate = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
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
        .from('candidates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // Create profile if it doesn't exist
        await createProfile();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('candidates')
        .insert({
          user_id: user.id,
          name: user.email || 'New User',
          skills: []
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      toast.success('Profile created successfully');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
    }
  };

  const updateProfile = async (updates: Partial<CandidateProfile>) => {
    if (!user) return;
    
    try {
      console.log('Updating profile with:', updates);
      
      const { data, error } = await supabase
        .from('candidates')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log('Profile updated successfully:', data);
      setProfile(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(`Failed to update profile: ${error.message}`);
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile
  };
};
