
-- Update the handle_new_user function to properly handle role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  -- Get role from user metadata, default to 'candidate'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'candidate');
  
  -- Insert into user_roles with the specified role
  INSERT INTO user_roles (user_id, email, role)
  VALUES (NEW.id, NEW.email, user_role::user_role);
  
  -- Insert into candidates table only if role is 'candidate'
  IF user_role = 'candidate' THEN
    INSERT INTO candidates (user_id, name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  END IF;
  
  -- Insert into recruiters table only if role is 'recruiter'  
  IF user_role = 'recruiter' THEN
    INSERT INTO recruiters (user_id, company_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', 'New Company'));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
