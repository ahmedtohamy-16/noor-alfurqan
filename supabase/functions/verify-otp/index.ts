import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// In-memory OTP storage (for demo - in production use Redis or database)
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

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

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    if (action === "generate") {
      // Generate a new OTP
      const { email, type = "signup" }: GenerateRequest = await req.json();

      if (!email) {
        return new Response(
          JSON.stringify({ error: "البريد الإلكتروني مطلوب" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP with 10-minute expiration
      otpStore.set(email.toLowerCase(), {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        attempts: 0,
      });

      // Send OTP via email
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY");

      const sendResponse = await fetch(`${supabaseUrl}/functions/v1/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ email, otp, type }),
      });

      if (!sendResponse.ok) {
        console.error("Failed to send OTP email");
      }

      console.log(`✅ OTP generated for ${email}: ${otp}`);

      return new Response(
        JSON.stringify({ success: true, message: "تم إرسال رمز التحقق" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === "verify") {
      // Verify OTP
      const { email, otp }: VerifyRequest = await req.json();

      if (!email || !otp) {
        return new Response(
          JSON.stringify({ error: "البريد الإلكتروني ورمز التحقق مطلوبان" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const stored = otpStore.get(email.toLowerCase());

      if (!stored) {
        return new Response(
          JSON.stringify({ valid: false, error: "لم يتم العثور على رمز تحقق. اطلب رمزاً جديداً" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check expiration
      if (Date.now() > stored.expiresAt) {
        otpStore.delete(email.toLowerCase());
        return new Response(
          JSON.stringify({ valid: false, error: "انتهت صلاحية الرمز. اطلب رمزاً جديداً" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check max attempts (5)
      if (stored.attempts >= 5) {
        otpStore.delete(email.toLowerCase());
        return new Response(
          JSON.stringify({ valid: false, error: "تجاوزت عدد المحاولات. اطلب رمزاً جديداً" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Verify OTP
      if (stored.otp !== otp) {
        stored.attempts++;
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: "رمز التحقق غير صحيح",
            remainingAttempts: 5 - stored.attempts 
          }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // OTP is valid - remove from store
      otpStore.delete(email.toLowerCase());

      console.log(`✅ OTP verified successfully for ${email}`);

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
