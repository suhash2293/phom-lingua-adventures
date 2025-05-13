
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

    console.log(`Processing admin setup for email: ${email}`);

    // Get the user by email using admin.listUsers()
    const { data: userData, error: userError } = await supabaseClient.auth.admin
      .listUsers()
    
    if (userError) {
      console.error('Error listing users:', userError)
      return new Response(
        JSON.stringify({ error: 'Error retrieving users' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Find the user with the matching email
    const user = userData.users.find(u => u.email === email)
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Found user with ID: ${user.id}`);

    // First check if profiles table exists
    try {
      // Try to create the profiles table if it doesn't exist
      const { error: createTableError } = await supabaseClient.query(`
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID PRIMARY KEY,
          email TEXT,
          is_admin BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
      `)
      
      if (createTableError) {
        console.log('Note: profiles table likely already exists or there was an error:', createTableError);
        // Continue anyway as the table might already exist
      }
    } catch (err) {
      console.log('Note about table creation:', err);
      // Continue anyway as the table might already exist
    }

    // Set the user as admin
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .upsert({ 
        id: user.id, 
        email: email, 
        is_admin: true 
      })
      
    if (updateError) {
      console.error('Error updating profile:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update admin status: ' + updateError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Successfully set ${email} as admin`);

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
      JSON.stringify({ error: 'Unexpected error occurred: ' + err.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
