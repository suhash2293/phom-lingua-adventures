import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyPinRequest {
  email: string;
  pin: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { email, pin }: VerifyPinRequest = await req.json();

    if (!email || !pin) {
      console.log("Missing email or PIN:", { email: !!email, pin: !!pin });
      return new Response(
        JSON.stringify({ error: "Email and PIN are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Hash the provided PIN for comparison
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const pinHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Find the most recent verification entry for this email
    const { data: verificationData, error: fetchError } = await supabase
      .from("email_verifications")
      .select("*")
      .eq("email", email)
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("Database fetch error:", fetchError);
      return new Response(
        JSON.stringify({ error: "Database error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!verificationData || verificationData.length === 0) {
      console.log("No valid verification found for email:", email);
      return new Response(
        JSON.stringify({ 
          error: "No valid verification found. Please request a new PIN." 
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const verification = verificationData[0];

    // Check if too many attempts have been made
    if (verification.attempts >= 5) {
      console.log("Too many attempts for verification:", verification.id);
      return new Response(
        JSON.stringify({ 
          error: "Too many failed attempts. Please request a new PIN." 
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Increment attempt count
    const { error: updateError } = await supabase
      .from("email_verifications")
      .update({ attempts: verification.attempts + 1 })
      .eq("id", verification.id);

    if (updateError) {
      console.error("Error updating attempt count:", updateError);
    }

    // Verify PIN
    if (verification.pin_hash !== pinHash) {
      console.log("Invalid PIN provided for email:", email);
      return new Response(
        JSON.stringify({ 
          error: "Invalid PIN. Please try again.", 
          attemptsRemaining: 5 - (verification.attempts + 1) 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Mark verification as completed
    const { error: verifyError } = await supabase
      .from("email_verifications")
      .update({ verified: true })
      .eq("id", verification.id);

    if (verifyError) {
      console.error("Error marking verification as complete:", verifyError);
      return new Response(
        JSON.stringify({ error: "Failed to complete verification" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Update user profile to mark email as verified
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ email_verified: true })
      .eq("email", email);

    if (profileError) {
      console.error("Error updating profile email verification:", profileError);
      // Don't fail the request if profile update fails
    }

    console.log("PIN verification successful for email:", email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email verified successfully" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-pin function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);