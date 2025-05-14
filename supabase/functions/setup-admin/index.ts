
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

    // First check if user exists
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
    
    let userId = null
    
    if (!user) {
      // If user doesn't exist, we'll create a profile entry with that email anyway
      // This allows for setup before the user is created
      console.log(`User not found for email ${email}, will create profile entry only`);
      userId = null
    } else {
      console.log(`Found user with ID: ${user.id}`);
      userId = user.id
    }

    // First check if profiles table exists
    try {
      // Try to create the profiles table if it doesn't exist
      const { error: createTableError } = await supabaseClient.query(`
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          is_admin BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
      `)
      
      if (createTableError) {
        console.log('Note: profiles table likely already exists or there was an error:', createTableError);
      }
    } catch (err) {
      console.log('Note about table creation:', err);
      // Continue anyway as the table might already exist
    }

    // Check if a profile with this email already exists
    const { data: existingProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      // If error is not "not found", then log it
      console.error('Error checking existing profile:', profileError)
    }

    if (existingProfile && !userId) {
      // Profile exists but no user with this email - preserve the profile
      console.log(`Profile exists for email ${email} but no matching user found`)
    } else if (existingProfile && userId && existingProfile.id !== userId) {
      // Profile exists but with different ID - update it to match auth user
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ id: userId, is_admin: true })
        .eq('email', email)
        
      if (updateError) {
        console.error('Error updating profile ID:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update admin profile: ' + updateError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      console.log(`Updated profile ID for ${email} to match auth user ID: ${userId}`)
    } else if (!existingProfile && userId) {
      // No profile but user exists - create profile with user ID
      const { error: insertError } = await supabaseClient
        .from('profiles')
        .insert({ id: userId, email, is_admin: true })
        
      if (insertError) {
        console.error('Error creating profile:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to create admin profile: ' + insertError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      console.log(`Created new profile for ${email} with ID: ${userId}`)
    } else if (!existingProfile && !userId) {
      // No profile and no user - create profile with null ID to be linked later
      // Use random UUID as placeholder
      const tempId = crypto.randomUUID()
      
      const { error: insertError } = await supabaseClient
        .from('profiles')
        .insert({ id: tempId, email, is_admin: true })
        
      if (insertError) {
        console.error('Error creating placeholder profile:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to create admin profile: ' + insertError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      console.log(`Created placeholder profile for ${email} with temporary ID: ${tempId}`)
    } else if (existingProfile) {
      // Profile exists and either has correct ID or no user exists
      // Just update admin status
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ is_admin: true })
        .eq('email', email)
        
      if (updateError) {
        console.error('Error updating admin status:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update admin status: ' + updateError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      console.log(`Updated admin status for ${email}`)
    }

    console.log(`Successfully set ${email} as admin`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User ${email} has been granted admin access. You can now sign in with this account.`,
        userExists: !!userId
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
