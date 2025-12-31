import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS
const allowedOrigins = [
  'https://noor-alfurqan.lovable.app',
  'https://id-preview--a627a8a5-f451-4c03-86fb-fc0ef654d906.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080',
];

// Get CORS headers based on origin
const getCorsHeaders = (origin: string | null): Record<string, string> => {
  const allowedOrigin = allowedOrigins.includes(origin || '') ? origin! : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

// Voice IDs for different languages/dialects
const voiceMap: Record<string, string> = {
  'ar': 'pqHfZKP75CvOlQylNhV4',
  'ar-eg': 'onwK4e9ZLuTAKqWW03F9',
  'ar-sa': 'JBFqnCBsd6RMkjVDRZzb',
  'ar-sy': 'TX3LPaxmHKxFdv7VOQHJ',
  'ar-ma': 'N2lVS1w4EtoT3dr4eOWO',
  'ar-iq': 'bIHbv24MWmeRgasZH58o',
  'en': 'EXAVITQu4vr4xnSDxMaL',
  'fr': 'FGY2WhTYpPnrIDTdsKH5',
  'ur': 'CwhRBWXzGAHq8TQ4Fs17',
  'id': 'iP95p4xoKVk53GoZ742B',
  'tr': 'cjVigY5qzO86Huf0OWal',
};

const RATE_LIMIT_MAX = 20; // Max requests per hour
const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour in milliseconds

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "يجب تسجيل الدخول لاستخدام هذه الخدمة" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Create client with user's auth
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "غير مصرح بالوصول" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Service client for database operations
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { data: recentLogs, error: logError } = await supabaseService
      .from('audio_generation_log')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo);

    if (logError) {
      console.error("Error checking rate limit:", logError);
    }

    if (recentLogs && recentLogs.length >= RATE_LIMIT_MAX) {
      return new Response(
        JSON.stringify({ error: `تم تجاوز الحد المسموح: ${RATE_LIMIT_MAX} طلب في الساعة` }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { text, language, prophetId } = await req.json();

    if (!text) {
      throw new Error("النص مطلوب");
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    // Log the request for rate limiting
    await supabaseService.from('audio_generation_log').insert({
      user_id: user.id,
      prophet_id: prophetId,
      text_length: text.length
    });

    // Get voice ID based on language
    const voiceId = voiceMap[language] || voiceMap['ar'];

    console.log(`User ${user.id} generating audio for prophet: ${prophetId}, language: ${language}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.substring(0, 5000),
          model_id: "eleven_multilingual_v2",
          output_format: "mp3_44100_128",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
            style: 0.4,
            use_speaker_boost: true,
            speed: 0.9,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(audioBuffer);
    
    // Convert to base64 properly
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64Audio = btoa(binary);

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        language,
        prophetId 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error generating audio:", error);
    const errorMessage = error instanceof Error ? error.message : "خطأ غير معروف";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...getCorsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
      }
    );
  }
});
