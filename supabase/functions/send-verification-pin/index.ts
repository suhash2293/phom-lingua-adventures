import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendPinRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("=== Send Verification PIN Handler Started ===");
  console.log("Request method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    
    console.log("Environment check:", {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      hasResendKey: !!resendKey
    });

    const supabase = createClient(
      supabaseUrl ?? "",
      supabaseKey ?? ""
    );

    const requestBody = await req.json();
    console.log("Request body received:", { email: requestBody.email });
    
    const { email }: SendPinRequest = requestBody;

    if (!email || !email.includes("@")) {
      console.log("Invalid email provided:", email);
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Rate limiting: Check if user has sent too many requests recently
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentRequests } = await supabase
      .from("email_verifications")
      .select("id")
      .eq("email", email)
      .gte("created_at", oneHourAgo);

    if (recentRequests && recentRequests.length >= 3) {
      console.log("Rate limit exceeded for email:", email);
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded. Please wait an hour before requesting another PIN." 
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate secure 4-digit PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("Generated PIN for email:", email);

    // Hash the PIN for storage
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const pinHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Store PIN in database with 15-minute expiry
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    
    const { error: dbError } = await supabase
      .from("email_verifications")
      .insert({
        email,
        pin_hash: pinHash,
        expires_at: expiresAt,
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to store verification data" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send PIN via email
    console.log("Attempting to send email to:", email);
    let emailResponse;
    try {
      emailResponse = await resend.emails.send({
        from: "Phom Learning App <onboarding@resend.dev>",
        to: [email],
        subject: "Your Verification PIN Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; text-align: center;">Email Verification</h2>
            <p style="color: #666; font-size: 16px;">Welcome to Phom Learning App!</p>
            <p style="color: #666; font-size: 16px;">Your verification PIN is:</p>
            <div style="background: #f5f5f5; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #333; letter-spacing: 8px;">${pin}</span>
            </div>
            <p style="color: #666; font-size: 14px;">This PIN will expire in 15 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this verification, please ignore this email.</p>
          </div>
        `,
      });
      console.log("Email sent successfully. Response:", JSON.stringify(emailResponse));
      
      // Check if Resend returned an error in the response (e.g., sandbox restrictions)
      if (emailResponse.error) {
        console.error("Resend API returned error:", emailResponse.error);
        return new Response(
          JSON.stringify({ 
            error: "Failed to send verification email. Please verify your email domain with Resend or ensure you're sending to an authorized test email.",
            details: emailResponse.error
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    } catch (emailError: any) {
      console.error("Failed to send email. Error:", emailError);
      console.error("Error details:", {
        message: emailError.message,
        name: emailError.name,
        stack: emailError.stack
      });
      return new Response(
        JSON.stringify({ 
          error: "Failed to send verification email. Please try again.",
          details: emailError.message
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("=== Send Verification PIN Success ===");
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification PIN sent to your email" 
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
    console.error("=== Send Verification PIN Error ===");
    console.error("Error:", error);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);