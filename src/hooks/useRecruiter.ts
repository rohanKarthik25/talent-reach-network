
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
    if (user && user.role === 'recruiter') {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      console.log('Fetching recruiter profile for user:', user?.id);
      const { data, error } = await supabase
        .from('recruiters')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching recruiter profile:', error);
        throw error;
      }

      if (!data) {
        console.log('No recruiter profile found, creating one...');
        await createProfile();
      } else {
        console.log('Recruiter profile found:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching recruiter profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    try {
      console.log('Creating recruiter profile for user:', user?.id);
      const { data, error } = await supabase
        .from('recruiters')
        .insert({
          user_id: user?.id,
          company_name: 'New Company'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating recruiter profile:', error);
        throw error;
      }
      
      console.log('Recruiter profile created:', data);
      setProfile(data);
      toast.success('Company profile created successfully');
    } catch (error) {
      console.error('Error creating recruiter profile:', error);
      toast.error('Failed to create profile');
    }
  };

  const updateProfile = async (updates: Partial<RecruiterProfile>) => {
    try {
      console.log('Updating recruiter profile with:', updates);
      const { data, error } = await supabase
        .from('recruiters')
        .update(updates)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating recruiter profile:', error);
        throw error;
      }
      
      console.log('Recruiter profile updated:', data);
      setProfile(data);
      toast.success('Company profile updated successfully');
    } catch (error) {
      console.error('Error updating recruiter profile:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const uploadFile = async (file: File, bucket: string, folder: string = '') => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Create a unique filename with user ID
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${folder}${Date.now()}.${fileExt}`;
      
      console.log('Uploading file:', fileName, 'to bucket:', bucket);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      console.log('Public URL:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(`Failed to upload file: ${error.message}`);
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
