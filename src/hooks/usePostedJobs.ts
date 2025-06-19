
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface PostedJob {
  id: string;
  job_title: string;
  employer: string;
  website?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  qualification: string;
  experience_level: string;
  notice_period?: string;
  job_description: string;
  skills_required: string[];
  post_duration: string;
  expires_at: string;
  created_at: string;
  status: string;
}

export const usePostedJobs = () => {
  const [jobs, setJobs] = useState<PostedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchJobs = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // First, get the recruiter ID for the current user
      const { data: recruiterData, error: recruiterError } = await supabase
        .from('recruiters')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (recruiterError || !recruiterData) {
        console.error('Error fetching recruiter:', recruiterError);
        setJobs([]);
        return;
      }

      // Fetch job postings for this recruiter
      const { data: jobsData, error: jobsError } = await supabase
        .from('job_postings')
        .select('*')
        .eq('recruiter_id', recruiterData.id)
        .order('created_at', { ascending: false });

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        toast.error('Failed to fetch posted jobs');
        return;
      }

      setJobs(jobsData || []);
    } catch (error) {
      console.error('Error fetching posted jobs:', error);
      toast.error('An error occurred while fetching jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  return {
    jobs,
    isLoading,
    refetch: fetchJobs
  };
};
