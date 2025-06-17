
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
      const role = user.raw_user_meta_data?.role || 'candidate'

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

      // Insert user role
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: role
        })

      if (roleError) {
        console.error('Error inserting user role:', roleError)
        throw roleError
      }

      // Create appropriate profile based on role
      if (role === 'candidate') {
        const { error: candidateError } = await supabaseAdmin
          .from('candidates')
          .insert({
            user_id: user.id,
            name: user.raw_user_meta_data?.name || user.email?.split('@')[0] || 'New User',
            skills: []
          })

        if (candidateError) {
          console.error('Error creating candidate profile:', candidateError)
          throw candidateError
        }
      } else if (role === 'recruiter') {
        const { error: recruiterError } = await supabaseAdmin
          .from('recruiters')
          .insert({
            user_id: user.id,
            company_name: user.raw_user_meta_data?.company_name || 'New Company'
          })

        if (recruiterError) {
          console.error('Error creating recruiter profile:', recruiterError)
          throw recruiterError
        }
      }

      console.log(`Successfully created ${role} profile for user ${user.id}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in webhook handler:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
