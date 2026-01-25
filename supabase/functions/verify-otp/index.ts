import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  email: string;
  otp: string;
}

interface GenerateRequest {
  email: string;
  type?: "signup" | "login" | "reset";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    if (action === "generate") {
      const { email, type = "signup" }: GenerateRequest = await req.json();

      if (!email) {
        return new Response(
          JSON.stringify({ error: "البريد الإلكتروني مطلوب" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail) || normalizedEmail.length > 255) {
        return new Response(
          JSON.stringify({ error: "صيغة البريد الإلكتروني غير صحيحة" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // TIME-BASED RATE LIMITING: Check for recent OTP (within 60 seconds)
      const rateLimitWindow = new Date(Date.now() - 60 * 1000).toISOString();
      const { data: recentOtp, error: rateCheckError } = await supabase
        .from("otp_codes")
        .select("created_at")
        .eq("email", normalizedEmail)
        .gte("created_at", rateLimitWindow)
        .maybeSingle();

      if (recentOtp) {
        console.warn(`⚠️ Rate limit hit for ${normalizedEmail} - OTP requested too recently`);
        return new Response(
          JSON.stringify({ 
            error: "يرجى الانتظار دقيقة قبل طلب رمز جديد",
            retryAfter: 60
          }),
          { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Delete only EXPIRED OTPs for this email (not all)
      await supabase
        .from("otp_codes")
        .delete()
        .eq("email", normalizedEmail)
        .lt("expires_at", new Date().toISOString());

      // Generate 6-digit OTP using cryptographically secure random
      const crypto = globalThis.crypto;
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      const otp = (100000 + (array[0] % 900000)).toString();
      
      // Store OTP in database with 10-minute expiration
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      
      const { error: insertError } = await supabase
        .from("otp_codes")
        .insert({
          email: normalizedEmail,
          code: otp,
          type,
          expires_at: expiresAt,
          attempts: 0,
        });

      if (insertError) {
        console.error("Failed to store OTP:", insertError);
        return new Response(
          JSON.stringify({ error: "فشل في إنشاء رمز التحقق" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Send OTP via email
      try {
        const sendResponse = await fetch(`${supabaseUrl}/functions/v1/send-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ email: normalizedEmail, otp, type }),
        });

        if (!sendResponse.ok) {
          console.error("Failed to send OTP email:", await sendResponse.text());
        }
      } catch (emailError) {
        console.error("Email sending error:", emailError);
      }

      console.log(`✅ OTP generated and stored for ${normalizedEmail}`);

      return new Response(
        JSON.stringify({ success: true, message: "تم إرسال رمز التحقق" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === "verify") {
      const { email, otp }: VerifyRequest = await req.json();

      if (!email || !otp) {
        return new Response(
          JSON.stringify({ error: "البريد الإلكتروني ورمز التحقق مطلوبان" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Get OTP from database
      const { data: otpRecord, error: fetchError } = await supabase
        .from("otp_codes")
        .select("*")
        .eq("email", normalizedEmail)
        .single();

      if (fetchError || !otpRecord) {
        return new Response(
          JSON.stringify({ valid: false, error: "لم يتم العثور على رمز تحقق. اطلب رمزاً جديداً" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check expiration
      if (new Date() > new Date(otpRecord.expires_at)) {
        await supabase.from("otp_codes").delete().eq("email", normalizedEmail);
        return new Response(
          JSON.stringify({ valid: false, error: "انتهت صلاحية الرمز. اطلب رمزاً جديداً" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check max attempts (5)
      if (otpRecord.attempts >= 5) {
        await supabase.from("otp_codes").delete().eq("email", normalizedEmail);
        return new Response(
          JSON.stringify({ valid: false, error: "تجاوزت عدد المحاولات. اطلب رمزاً جديداً" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Verify OTP
      if (otpRecord.code !== otp) {
        // Increment attempts
        await supabase
          .from("otp_codes")
          .update({ attempts: otpRecord.attempts + 1 })
          .eq("email", normalizedEmail);

        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: "رمز التحقق غير صحيح",
            remainingAttempts: 5 - (otpRecord.attempts + 1)
          }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // OTP is valid - delete from database
      await supabase.from("otp_codes").delete().eq("email", normalizedEmail);

      console.log(`✅ OTP verified successfully for ${normalizedEmail}`);

      return new Response(
        JSON.stringify({ valid: true, message: "تم التحقق بنجاح" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use ?action=generate or ?action=verify" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in verify-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "حدث خطأ" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
