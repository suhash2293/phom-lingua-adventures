
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AccountDeletionRequest {
  deletion_method: 'in_app' | 'web'
  reason?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('User authentication error:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (req.method === 'POST') {
      const requestBody: AccountDeletionRequest = await req.json()
      
      console.log('Creating account deletion request for user:', user.id)

      // Check if there's already a pending deletion request
      const { data: existingRequest } = await supabaseClient
        .from('account_deletion_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .single()

      if (existingRequest) {
        return new Response(
          JSON.stringify({ 
            error: 'Account deletion already requested',
            scheduled_date: existingRequest.deletion_scheduled_at
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Create deletion request
      const { data: deletionRequest, error: requestError } = await supabaseClient
        .from('account_deletion_requests')
        .insert({
          user_id: user.id,
          deletion_method: requestBody.deletion_method,
          reason: requestBody.reason || null,
        })
        .select()
        .single()

      if (requestError) {
        console.error('Error creating deletion request:', requestError)
        return new Response(
          JSON.stringify({ error: 'Failed to create deletion request' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Deletion request created:', deletionRequest)

      return new Response(
        JSON.stringify({ 
          success: true, 
          deletion_scheduled_at: deletionRequest.deletion_scheduled_at,
          message: 'Account deletion scheduled for 30 days from now' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (req.method === 'DELETE') {
      console.log('Processing immediate account deletion for user:', user.id)

      // Call the database function to delete all user data
      const { data, error: deleteError } = await supabaseClient
        .rpc('delete_user_account', { target_user_id: user.id })

      if (deleteError) {
        console.error('Error deleting account:', deleteError)
        return new Response(
          JSON.stringify({ error: 'Failed to delete account' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Account deleted successfully for user:', user.id)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Account deleted successfully' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
