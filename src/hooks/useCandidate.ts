
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
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<CandidateProfile>) => {
    try {
      const { error } = await supabase
        .from('candidates')
        .update(updates)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const uploadFile = async (file: File, bucket: string, folder: string = '') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      throw error;
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    uploadFile,
    refetch: fetchProfile
  };
};
