
-- Create a table to store job postings with all the required fields
CREATE TABLE public.job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recruiter_id UUID REFERENCES public.recruiters(id) NOT NULL,
  job_title TEXT NOT NULL,
  employer TEXT NOT NULL,
  website TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL,
  qualification TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  notice_period TEXT,
  job_description TEXT NOT NULL,
  skills_required TEXT[] DEFAULT '{}',
  post_duration TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'active'
);

-- Enable Row Level Security
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

-- Policy to allow recruiters to view their own job postings
CREATE POLICY "Recruiters can view their own job postings" 
  ON public.job_postings 
  FOR SELECT 
  USING (recruiter_id IN (SELECT id FROM public.recruiters WHERE user_id = auth.uid()));

-- Policy to allow recruiters to create job postings
CREATE POLICY "Recruiters can create job postings" 
  ON public.job_postings 
  FOR INSERT 
  WITH CHECK (recruiter_id IN (SELECT id FROM public.recruiters WHERE user_id = auth.uid()));

-- Policy to allow recruiters to update their own job postings
CREATE POLICY "Recruiters can update their own job postings" 
  ON public.job_postings 
  FOR UPDATE 
  USING (recruiter_id IN (SELECT id FROM public.recruiters WHERE user_id = auth.uid()));

-- Policy to allow recruiters to delete their own job postings
CREATE POLICY "Recruiters can delete their own job postings" 
  ON public.job_postings 
  FOR DELETE 
  USING (recruiter_id IN (SELECT id FROM public.recruiters WHERE user_id = auth.uid()));

-- Policy to allow candidates to view active job postings
CREATE POLICY "Candidates can view active job postings" 
  ON public.job_postings 
  FOR SELECT 
  USING (status = 'active' AND expires_at > now());

-- Create trigger to update the updated_at column
CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
