
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own candidate profile" ON candidates;
DROP POLICY IF EXISTS "Users can update their own candidate profile" ON candidates;
DROP POLICY IF EXISTS "Users can insert their own candidate profile" ON candidates;
DROP POLICY IF EXISTS "Users can view their own recruiter profile" ON recruiters;
DROP POLICY IF EXISTS "Users can update their own recruiter profile" ON recruiters;
DROP POLICY IF EXISTS "Users can insert their own recruiter profile" ON recruiters;
DROP POLICY IF EXISTS "Anyone can view jobs" ON jobs;
DROP POLICY IF EXISTS "Recruiters can manage their own jobs" ON jobs;
DROP POLICY IF EXISTS "Candidates can view their own applications" ON applications;
DROP POLICY IF EXISTS "Recruiters can view applications for their jobs" ON applications;
DROP POLICY IF EXISTS "Candidates can create applications" ON applications;
DROP POLICY IF EXISTS "Recruiters can update applications for their jobs" ON applications;
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can update their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can insert their own role" ON user_roles;

-- Enable RLS on existing tables
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for candidates table
CREATE POLICY "Users can view their own candidate profile" ON candidates
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own candidate profile" ON candidates
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own candidate profile" ON candidates
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for recruiters table
CREATE POLICY "Users can view their own recruiter profile" ON recruiters
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own recruiter profile" ON recruiters
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own recruiter profile" ON recruiters
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for jobs table
CREATE POLICY "Anyone can view jobs" ON jobs
  FOR SELECT USING (true);

CREATE POLICY "Recruiters can manage their own jobs" ON jobs
  FOR ALL USING (recruiter_id IN (SELECT id FROM recruiters WHERE user_id = auth.uid()));

-- Create RLS policies for applications table
CREATE POLICY "Candidates can view their own applications" ON applications
  FOR SELECT USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()));

CREATE POLICY "Recruiters can view applications for their jobs" ON applications
  FOR SELECT USING (job_id IN (SELECT id FROM jobs WHERE recruiter_id IN (SELECT id FROM recruiters WHERE user_id = auth.uid())));

CREATE POLICY "Candidates can create applications" ON applications
  FOR INSERT WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()));

CREATE POLICY "Recruiters can update applications for their jobs" ON applications
  FOR UPDATE USING (job_id IN (SELECT id FROM jobs WHERE recruiter_id IN (SELECT id FROM recruiters WHERE user_id = auth.uid())));

-- Create RLS policies for user_roles table
CREATE POLICY "Users can view their own role" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own role" ON user_roles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own role" ON user_roles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Update the handle_new_user function to work with the current schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Insert into user_roles with default role 'candidate'
  INSERT INTO user_roles (user_id, email, role)
  VALUES (NEW.id, NEW.email, 'candidate');
  
  -- Insert into candidates table for new users
  INSERT INTO candidates (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  
  RETURN NEW;
END;
$function$;

-- Create the trigger to automatically create user profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
