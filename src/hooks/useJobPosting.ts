
import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface JobPostingData {
  jobTitle: string;
  employer: string;
  website?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  qualification: string;
  experienceLevel: string;
  noticePeriod?: string;
  jobDescription: string;
}

export const useJobPosting = () => {
  const [isPosting, setIsPosting] = useState(false);
  const { user } = useAuth();

  const postJob = async (jobData: JobPostingData, skills: string[], duration: string) => {
    if (!user) {
      toast.error('You must be logged in to post a job');
      return false;
    }

    setIsPosting(true);
    
    try {
      // First, get the recruiter ID for the current user
      const { data: recruiterData, error: recruiterError } = await supabase
        .from('recruiters')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (recruiterError || !recruiterData) {
        toast.error('Recruiter profile not found. Please complete your profile first.');
        return false;
      }

      // Calculate expiration date based on duration
      const expirationDate = new Date();
      const durationMap: { [key: string]: number } = {
        '7-days': 7,
        '15-days': 15,
        '30-days': 30,
        '60-days': 60,
        '90-days': 90
      };
      
      expirationDate.setDate(expirationDate.getDate() + (durationMap[duration] || 30));

      // Insert the job posting
      const { error: insertError } = await supabase
        .from('job_postings')
        .insert({
          recruiter_id: recruiterData.id,
          job_title: jobData.jobTitle,
          employer: jobData.employer,
          website: jobData.website || null,
          address_line1: jobData.addressLine1,
          address_line2: jobData.addressLine2 || null,
          city: jobData.city,
          state: jobData.state,
          zip_code: jobData.zipCode,
          country: jobData.country,
          qualification: jobData.qualification,
          experience_level: jobData.experienceLevel,
          notice_period: jobData.noticePeriod || null,
          job_description: jobData.jobDescription,
          skills_required: skills,
          post_duration: duration,
          expires_at: expirationDate.toISOString(),
          status: 'active'
        });

      if (insertError) {
        console.error('Error posting job:', insertError);
        toast.error('Failed to post job. Please try again.');
        return false;
      }

      toast.success('Job posted successfully!');
      return true;
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('An unexpected error occurred. Please try again.');
      return false;
    } finally {
      setIsPosting(false);
    }
  };

  return {
    postJob,
    isPosting
  };
};
