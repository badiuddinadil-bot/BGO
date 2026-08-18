import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper: Compute SHA-256 hex digest for server-side OTP storage security
async function hashOtp(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
    const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "RESEND_API_KEY is not configured in Supabase secrets." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json();
    const { action, email, otp, context, fullName } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email address is required." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ACTION 1: SEND OTP (SERVER-SIDE GENERATION + SHA-256 HASHING + RESEND API DELIVERY)
    if (action === "send") {
      // 1. Throttling Check: Prevent spamming (max 1 OTP send per 60 seconds per email)
      const { data: recent } = await supabase
        .from("otp_codes")
        .select("created_at")
        .eq("email", normalizedEmail)
        .order("created_at", { ascending: false })
        .limit(1);

      if (recent && recent.length > 0) {
        const lastCreated = new Date(recent[0].created_at).getTime();
        if (Date.now() - lastCreated < 60 * 1000) {
          return new Response(
            JSON.stringify({ success: false, error: "Please wait 60 seconds before requesting another code." }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
          );
        }
      }

      // 2. Cryptographically Secure 6-Digit OTP Generation
      const randomBuf = new Uint32Array(1);
      crypto.getRandomValues(randomBuf);
      const secureOtp = (100000 + (randomBuf[0] % 900000)).toString();

      // 3. Compute SHA-256 Hash of OTP for Server-Side Storage
      const hashedOtp = await hashOtp(secureOtp);

      // 4. Expiration: 10 minutes from now
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // 5. Save Server-Side Hashed OTP Record in public.otp_codes
      const { error: dbErr } = await supabase.from("otp_codes").insert([{
        email: normalizedEmail,
        otp_hash: hashedOtp,
        expires_at: expiresAt,
        attempts: 0,
        max_attempts: 3,
        used: false
      }]);

      if (dbErr) {
        return new Response(
          JSON.stringify({ success: false, error: "Failed to initialize server-side OTP record." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      // 6. Send Real Email via Resend REST API
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: `Bahmani Group Oman <${resendFromEmail}>`,
          to: [normalizedEmail],
          subject: "Bahmani Group Oman — Email Verification Code",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #0f4c3a; text-align: center;">Bahmani Group Oman (BGO)</h2>
              <p style="font-size: 16px; color: #333333;">Assalamu Alaikum ${fullName || 'Member'},</p>
              <p style="font-size: 15px; color: #555555;">Your email verification code for <strong>${(context || 'Registration').toUpperCase()}</strong> is:</p>
              <div style="background-color: #f7fafc; border: 2px dashed #0f4c3a; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f4c3a;">${secureOtp}</span>
              </div>
              <p style="font-size: 14px; color: #718096;">This code expires in <strong>10 minutes</strong>.</p>
              <p style="font-size: 13px; color: #e53e3e; font-weight: bold;">For your security, do not share this code with anyone.</p>
              <hr style="border: none; border-top: 1px solid #edf2f7; margin: 20px 0;">
              <p style="font-size: 12px; color: #a0aec0; text-align: center;">&copy; 2026 Bahmani Group Oman. All Rights Reserved.</p>
            </div>
          `
        })
      });

      if (!resendRes.ok) {
        // Log to email_logs as FAILED (without exposing OTP)
        await supabase.from("email_logs").insert([{
          to_email: normalizedEmail,
          to_name: fullName || normalizedEmail,
          category: "OTP Dispatch Failed",
          subject: "Bahmani Group Oman — Email Verification Code",
          body: "Resend API rejected delivery attempt.",
          status: "FAILED ❌"
        }]);

        return new Response(
          JSON.stringify({ success: false, error: "Unable to send the verification email. Please verify domain setup or try again." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Record successful delivery in public.email_logs AFTER Resend accepts it (without exposing OTP)
      await supabase.from("email_logs").insert([{
        to_email: normalizedEmail,
        to_name: fullName || normalizedEmail,
        category: "Secure OTP Verification",
        subject: "Bahmani Group Oman — Email Verification Code",
        body: "Transactional email accepted by Resend provider.",
        status: "DELIVERED ✅"
      }]);

      // RETURN ONLY SAFE SUCCESS RESPONSE (NEVER RETURN THE OTP TO THE BROWSER!)
      return new Response(
        JSON.stringify({ success: true, message: "Verification code sent to your email address." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ACTION 2: VERIFY OTP (SERVER-SIDE SECURE SHA-256 HASH VERIFICATION)
    if (action === "verify") {
      if (!otp) {
        return new Response(
          JSON.stringify({ success: false, error: "Verification code is required." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Fetch latest valid unused OTP record for this email
      const { data: records } = await supabase
        .from("otp_codes")
        .select("*")
        .eq("email", normalizedEmail)
        .eq("used", false)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!records || records.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: "Verification code expired. Please request a new code." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      const otpRecord = records[0];

      // Check Expiration (10 mins)
      if (new Date() > new Date(otpRecord.expires_at)) {
        return new Response(
          JSON.stringify({ success: false, error: "Verification code expired. Please request a new code." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Safely Increment Attempt Counter FIRST before evaluating max attempts
      const newAttempts = otpRecord.attempts + 1;
      await supabase
        .from("otp_codes")
        .update({ attempts: newAttempts })
        .eq("id", otpRecord.id);

      // Check Attempt Limit (3 max)
      if (newAttempts > otpRecord.max_attempts) {
        return new Response(
          JSON.stringify({ success: false, error: "Verification attempt limit exceeded. Please request a new code." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Compute SHA-256 Hash of Submitted OTP
      const inputHash = await hashOtp(otp.trim());

      // Verify SHA-256 Hash Match
      if (inputHash !== otpRecord.otp_hash) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid verification code." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Mark OTP as used to prevent replay
      await supabase
        .from("otp_codes")
        .update({ used: true })
        .eq("id", otpRecord.id);

      return new Response(
        JSON.stringify({ success: true, message: "Verification successful." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid action requested." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: "Server-side error processing request." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
