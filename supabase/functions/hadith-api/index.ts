import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HADITH_API_BASE = 'https://hadithapi.pages.dev/api';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path') || '';
    
    // Build the API URL
    let apiUrl = `${HADITH_API_BASE}/${path}`;
    
    // Forward query params (except path)
    const queryParams = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      if (key !== 'path') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    if (queryString) {
      apiUrl += `?${queryString}`;
    }

    console.log('Fetching from:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NoorAlFurqan/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
