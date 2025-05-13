
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Create a Supabase client with the Admin key
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API SERVICE ROLE KEY - env var exported by default.
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get the request body
    const { email } = await req.json()
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // First, ensure the profiles table exists
    const { error: tableCheckError } = await supabaseClient
      .rpc('check_table_exists', { table_name: 'profiles' })
    
    if (tableCheckError) {
      // Create the profiles table if it doesn't exist
      const { error: createTableError } = await supabaseClient.query(`
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
          email TEXT,
          is_admin BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own profile" 
          ON public.profiles 
          FOR SELECT USING (auth.uid() = id);
          
        CREATE POLICY "Users can update their own profile" 
          ON public.profiles 
          FOR UPDATE USING (auth.uid() = id);
      `)
      
      if (createTableError) {
        console.error('Error creating profiles table:', createTableError)
        return new Response(
          JSON.stringify({ error: 'Failed to setup database tables' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Get the user by email
    const { data: userData, error: userError } = await supabaseClient
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single()
    
    if (userError) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Set the user as admin
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .upsert({ 
        id: userData.id, 
        email: email, 
        is_admin: true 
      })
      
    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update admin status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User ${email} has been granted admin access` 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Unexpected error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
