
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    console.log('Creating demo users...')

    // Demo users to create
    const demoUsers = [
      {
        email: 'candidate@demo.com',
        password: 'demo123',
        role: 'candidate',
        metadata: { name: 'Demo Candidate' }
      },
      {
        email: 'recruiter@demo.com',
        password: 'demo123',
        role: 'recruiter',
        metadata: { name: 'Demo Recruiter', company_name: 'Demo Company' }
      }
    ]

    const results = []

    for (const demoUser of demoUsers) {
      try {
        // Check if user already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const userExists = existingUsers.users.some(u => u.email === demoUser.email)

        if (userExists) {
          console.log(`User ${demoUser.email} already exists, skipping...`)
          results.push({ email: demoUser.email, status: 'already_exists' })
          continue
        }

        // Create user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: demoUser.email,
          password: demoUser.password,
          email_confirm: true,
          user_metadata: {
            ...demoUser.metadata,
            role: demoUser.role
          }
        })

        if (createError) {
          console.error(`Error creating user ${demoUser.email}:`, createError)
          results.push({ email: demoUser.email, status: 'error', error: createError.message })
          continue
        }

        console.log(`Successfully created user ${demoUser.email}`)
        results.push({ email: demoUser.email, status: 'created', user_id: newUser.user?.id })

      } catch (error) {
        console.error(`Error processing user ${demoUser.email}:`, error)
        results.push({ email: demoUser.email, status: 'error', error: error.message })
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Demo users creation process completed',
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in create-demo-users function:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
