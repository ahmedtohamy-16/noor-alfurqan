import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Voice IDs for different languages/dialects
const voiceMap: Record<string, string> = {
  'ar': 'pqHfZKP75CvOlQylNhV4', // Bill - for standard Arabic
  'ar-eg': 'onwK4e9ZLuTAKqWW03F9', // Daniel - for Egyptian
  'ar-sa': 'JBFqnCBsd6RMkjVDRZzb', // George - for Saudi
  'ar-sy': 'TX3LPaxmHKxFdv7VOQHJ', // Liam - for Syrian
  'ar-ma': 'N2lVS1w4EtoT3dr4eOWO', // Callum - for Moroccan
  'ar-iq': 'bIHbv24MWmeRgasZH58o', // Will - for Iraqi
  'en': 'EXAVITQu4vr4xnSDxMaL', // Sarah - for English
  'fr': 'FGY2WhTYpPnrIDTdsKH5', // Laura - for French
  'ur': 'CwhRBWXzGAHq8TQ4Fs17', // Roger - for Urdu
  'id': 'iP95p4xoKVk53GoZ742B', // Chris - for Indonesian
  'tr': 'cjVigY5qzO86Huf0OWal', // Eric - for Turkish
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language, prophetId } = await req.json();

    if (!text) {
      throw new Error("Text is required");
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    // Get voice ID based on language
    const voiceId = voiceMap[language] || voiceMap['ar'];

    console.log(`Generating audio for prophet: ${prophetId}, language: ${language}, voice: ${voiceId}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.substring(0, 5000), // Limit text length
          model_id: "eleven_multilingual_v2",
          output_format: "mp3_44100_128",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
            style: 0.4,
            use_speaker_boost: true,
            speed: 0.9, // Slightly slower for storytelling
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
