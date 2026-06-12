import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const TESTMAIL_API_KEY = Deno.env.get("Api_key_testmail");
const TESTMAIL_NAMESPACE = Deno.env.get("Namespace");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OtpRequest {
  email: string;
  otp: string;
  type: "signup" | "login" | "reset";
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Require service-role bearer — only invoked by verify-otp internally
  const authHeader = req.headers.get("Authorization") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!serviceKey || authHeader !== `Bearer ${serviceKey}`) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { email, otp, type }: OtpRequest = await req.json();


    if (!email || !otp) {
      return new Response(
        JSON.stringify({ error: "البريد الإلكتروني ورمز التحقق مطلوبان" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const typeMessages = {
      signup: "تفعيل حسابك",
      login: "تسجيل الدخول",
      reset: "إعادة تعيين كلمة المرور",
    };

    const emailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>رمز التحقق - نور الفرقان</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 500px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                نور الفرقان
              </h1>
              <p style="margin: 8px 0 0; color: #b8d4e8; font-size: 14px;">
                Noor-Alfurqan
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #1e3a5f; font-size: 20px; text-align: center;">
                رمز التحقق الخاص بك
              </h2>
              <p style="margin: 0 0 24px; color: #666666; font-size: 15px; line-height: 1.6; text-align: center;">
                استخدم الرمز التالي لـ ${typeMessages[type] || "التحقق"}:
              </p>
              
              <!-- OTP Code -->
              <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e3a5f; font-family: 'Courier New', monospace;">
                  ${otp}
                </span>
              </div>
              
              <p style="margin: 0 0 16px; color: #999999; font-size: 13px; text-align: center;">
                هذا الرمز صالح لمدة 10 دقائق فقط
              </p>
              
              <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <p style="margin: 0; color: #856404; font-size: 13px; text-align: center;">
                  ⚠️ إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} نور الفرقان — Noor-Alfurqan
              </p>
              <p style="margin: 8px 0 0; color: #cccccc; font-size: 11px;">
                تطبيق القرآن الكريم
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email via Testmail.app SMTP or API
    // Using Testmail's REST API endpoint
    const response = await fetch("https://api.testmail.app/api/json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TESTMAIL_API_KEY}`,
      },
      body: JSON.stringify({
        api_key: TESTMAIL_API_KEY,
        namespace: TESTMAIL_NAMESPACE,
        tag: email.replace(/[^a-zA-Z0-9]/g, "_"),
        to: email,
        subject: `رمز التحقق: ${otp} — نور الفرقان`,
        from: `نور الفرقان — Noor-Alfurqan <${TESTMAIL_NAMESPACE}@inbox.testmail.app>`,
        html: emailHtml,
        text: `رمز التحقق الخاص بك هو: ${otp}\n\nهذا الرمز صالح لمدة 10 دقائق.\n\nنور الفرقان — Noor-Alfurqan`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Testmail API error:", errorText);
      const redacted = email.replace(/(.).+(@.+)/, "$1***$2");
      console.warn(`📧 OTP delivery failed for ${redacted}`);

      return new Response(
        JSON.stringify({
          success: false,
          error: "تعذّر إرسال رمز التحقق. حاول لاحقاً",
        }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const result = await response.json();
    console.log("✅ OTP email sent successfully to:", email);

    return new Response(
      JSON.stringify({ success: true, message: "تم إرسال رمز التحقق بنجاح" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "حدث خطأ في إرسال الرمز" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
