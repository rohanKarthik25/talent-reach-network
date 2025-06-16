
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: any
  schema: string
  old_record: any
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: WebhookPayload = await req.json()
    console.log('Received webhook payload:', payload)

    if (payload.type === 'INSERT' && payload.table === 'users') {
      const user = payload.record
      const userEmail = user.email
      const role = user.raw_user_meta_data?.role || 'candidate'

      // Special handling for admin user
      const isAdmin = userEmail === 'rohankarthik402@gmail.com'
      const finalRole = isAdmin ? 'admin' : role

      console.log(`Processing user ${user.id} with email ${userEmail} and role ${finalRole}`)

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      // Create user_roles table if it doesn't exist
      try {
        const { error: createTableError } = await supabaseAdmin.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS public.user_roles (
              id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id uuid NOT NULL,
              role text NOT NULL DEFAULT 'candidate',
              created_at timestamp with time zone DEFAULT now(),
              updated_at timestamp with time zone DEFAULT now()
            );
            
            ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY IF NOT EXISTS "Users can view their own role" ON public.user_roles
            FOR SELECT USING (auth.uid() = user_id);
            
            CREATE POLICY IF NOT EXISTS "Users can insert their own role" ON public.user_roles
            FOR INSERT WITH CHECK (auth.uid() = user_id);
          `
        })
        
        if (createTableError) {
          console.log('Table creation note:', createTableError.message)
        }
      } catch (tableError) {
        console.log('Table setup note:', tableError)
      }

      // Insert user role - this is critical for admin access
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: finalRole
        })

      if (roleError) {
        console.error('Error inserting user role:', roleError)
      } else {
        console.log(`Successfully inserted role ${finalRole} for user ${user.id}`)
      }

      // Create profile only for non-admin users
      if (finalRole !== 'admin') {
        if (finalRole === 'candidate') {
          // Create candidates table and profile
          try {
            await supabaseAdmin.rpc('exec_sql', {
              sql: `
                CREATE TABLE IF NOT EXISTS public.candidates (
                  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
                  user_id uuid NOT NULL,
                  name text,
                  phone text,
                  location text,
                  education text,
                  experience text,
                  skills text[] DEFAULT '{}',
                  resume_url text,
                  license_type text,
                  license_number text,
                  created_at timestamp with time zone DEFAULT now(),
                  updated_at timestamp with time zone DEFAULT now()
                );
                
                ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
                
                CREATE POLICY IF NOT EXISTS "Users can view their own candidate profile" ON public.candidates
                FOR SELECT USING (auth.uid() = user_id);
                
                CREATE POLICY IF NOT EXISTS "Users can update their own candidate profile" ON public.candidates
                FOR UPDATE USING (auth.uid() = user_id);
                
                CREATE POLICY IF NOT EXISTS "Users can insert their own candidate profile" ON public.candidates
                FOR INSERT WITH CHECK (auth.uid() = user_id);
              `
            })

            const { error: candidateError } = await supabaseAdmin
              .from('candidates')
              .insert({
                user_id: user.id,
                name: user.raw_user_meta_data?.name || user.email?.split('@')[0] || 'New User',
                skills: []
              })

            if (candidateError) {
              console.error('Error creating candidate profile:', candidateError)
            } else {
              console.log(`Successfully created candidate profile for user ${user.id}`)
            }
          } catch (error) {
            console.log('Candidate profile creation note:', error)
          }
        } else if (finalRole === 'recruiter') {
          // Create recruiters table and profile
          try {
            await supabaseAdmin.rpc('exec_sql', {
              sql: `
                CREATE TABLE IF NOT EXISTS public.recruiters (
                  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
                  user_id uuid NOT NULL,
                  company_name text,
                  industry text,
                  description text,
                  location text,
                  logo_url text,
                  created_at timestamp with time zone DEFAULT now(),
                  updated_at timestamp with time zone DEFAULT now()
                );
                
                ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
                
                CREATE POLICY IF NOT EXISTS "Users can view their own recruiter profile" ON public.recruiters
                FOR SELECT USING (auth.uid() = user_id);
                
                CREATE POLICY IF NOT EXISTS "Users can update their own recruiter profile" ON public.recruiters
                FOR UPDATE USING (auth.uid() = user_id);
                
                CREATE POLICY IF NOT EXISTS "Users can insert their own recruiter profile" ON public.recruiters
                FOR INSERT WITH CHECK (auth.uid() = user_id);
              `
            })

            const { error: recruiterError } = await supabaseAdmin
              .from('recruiters')
              .insert({
                user_id: user.id,
                company_name: user.raw_user_meta_data?.company_name || 'New Company'
              })

            if (recruiterError) {
              console.error('Error creating recruiter profile:', recruiterError)
            } else {
              console.log(`Successfully created recruiter profile for user ${user.id}`)
            }
          } catch (error) {
            console.log('Recruiter profile creation note:', error)
          }
        }
      }

      console.log(`Successfully processed new user ${user.id} with role ${finalRole}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in webhook handler:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
