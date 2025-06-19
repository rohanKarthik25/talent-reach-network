
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CandidateProfile {
  id: string;
  user_id: string;
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  id_passport?: string;
  gender?: string;
  age?: number;
  location?: string;
  education?: string;
  experience?: string;
  skills?: string[];
  resume_url?: string;
  license_type?: string;
  license_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EducationRecord {
  id: string;
  candidate_id: string;
  qualification_type: string;
  document_url?: string;
  created_at: string;
  updated_at: string;
}

export const useCandidate = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [educationRecords, setEducationRecords] = useState<EducationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchEducationRecords();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching candidate profile:', error);
        if (error.code === 'PGRST116') {
          await createProfile();
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching candidate profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchEducationRecords = async () => {
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('candidate_education')
        .select('*')
        .eq('candidate_id', profile?.id || '')
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching education records:', error);
        return;
      }

      setEducationRecords(data || []);
    } catch (error) {
      console.error('Error fetching education records:', error);
    }
  };

  const createProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .insert({
          user_id: user?.id,
          name: '',
          skills: []
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      toast.success('Profile created successfully');
    } catch (error) {
      console.error('Error creating candidate profile:', error);
      toast.error('Failed to create profile');
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
      console.error('Error updating candidate profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const addEducationRecord = async (qualificationType: string, documentUrl?: string) => {
    try {
      if (!profile?.id) {
        toast.error('Profile not found');
        return;
      }

      const { data, error } = await supabase
        .from('candidate_education')
        .insert({
          candidate_id: profile.id,
          qualification_type: qualificationType,
          document_url: documentUrl
        })
        .select()
        .single();

      if (error) throw error;

      setEducationRecords(prev => [data, ...prev]);
      toast.success('Education qualification added successfully');
    } catch (error) {
      console.error('Error adding education record:', error);
      toast.error('Failed to add education qualification');
    }
  };

  const deleteEducationRecord = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('candidate_education')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      setEducationRecords(prev => prev.filter(record => record.id !== recordId));
      toast.success('Education qualification deleted successfully');
    } catch (error) {
      console.error('Error deleting education record:', error);
      toast.error('Failed to delete education qualification');
    }
  };

  const uploadFile = async (file: File, bucket: string, folder: string = '') => {
    try {
      if (!user) throw new Error('User not authenticated');
      
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
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Failed to upload file: ${error.message}`);
      throw error;
    }
  };

  // Refetch education records when profile changes
  useEffect(() => {
    if (profile?.id) {
      fetchEducationRecords();
    }
  }, [profile?.id]);

  return {
    profile,
    setProfile,
    educationRecords,
    loading,
    updateProfile,
    addEducationRecord,
    deleteEducationRecord,
    uploadFile,
    refetch: () => {
      fetchProfile();
      fetchEducationRecords();
    }
  };
};
