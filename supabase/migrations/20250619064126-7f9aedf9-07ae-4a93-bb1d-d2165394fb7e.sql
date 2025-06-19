
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view their own education records" ON public.candidate_education;
DROP POLICY IF EXISTS "Users can insert their own education records" ON public.candidate_education;
DROP POLICY IF EXISTS "Users can update their own education records" ON public.candidate_education;
DROP POLICY IF EXISTS "Users can delete their own education records" ON public.candidate_education;

-- Drop storage policies that might exist
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;

-- Add missing columns to candidates table if they don't exist
ALTER TABLE public.candidates 
ADD COLUMN IF NOT EXISTS surname text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS id_passport text,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS age integer;

-- Create candidate_education table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.candidate_education (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id uuid REFERENCES public.candidates(id) ON DELETE CASCADE,
  qualification_type text NOT NULL,
  document_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_education ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for candidate_education table
CREATE POLICY "Users can view their own education records" 
ON public.candidate_education FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM public.candidates WHERE id = candidate_id));

CREATE POLICY "Users can insert their own education records" 
ON public.candidate_education FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.candidates WHERE id = candidate_id));

CREATE POLICY "Users can update their own education records" 
ON public.candidate_education FOR UPDATE 
USING (auth.uid() IN (SELECT user_id FROM public.candidates WHERE id = candidate_id));

CREATE POLICY "Users can delete their own education records" 
ON public.candidate_education FOR DELETE 
USING (auth.uid() IN (SELECT user_id FROM public.candidates WHERE id = candidate_id));

-- Storage policies for documents
CREATE POLICY "Users can upload their own documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for resumes
CREATE POLICY "Users can upload their own resumes" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own resumes" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own resumes" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own resumes" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
