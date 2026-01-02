import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/halimbahae/Hadith/main';

// Book folder mappings
const bookMappings: Record<string, { folder: string; fileWithDiacritics: string; fileWithoutDiacritics: string }> = {
  bukhari: {
    folder: 'Sahih_Al-Bukhari',
    fileWithDiacritics: 'sahih_al-bukhari_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'sahih_al-bukhari_ahadith.utf8.csv'
  },
  muslim: {
    folder: 'Sahih_Muslim',
    fileWithDiacritics: 'sahih_muslim_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'sahih_muslim_ahadith.utf8.csv'
  },
  abudawud: {
    folder: 'Sunan_Abu-Dawud',
    fileWithDiacritics: 'sunan_abi_dawud_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'sunan_abi_dawud_ahadith.utf8.csv'
  },
  tirmidhi: {
    folder: 'Sunan_Al-Tirmidhi',
    fileWithDiacritics: 'sunan_al-tirmizi_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'sunan_al-tirmizi_ahadith.utf8.csv'
  },
  nasai: {
    folder: 'Sunan_Al-Nasai',
    fileWithDiacritics: 'sunan_al-nasai_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'sunan_al-nasai_ahadith.utf8.csv'
  },
  ibnmajah: {
    folder: 'Sunan_Ibn-Maja',
    fileWithDiacritics: 'sunan_ibn_maja_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'sunan_ibn_maja_ahadith.utf8.csv'
  },
  malik: {
    folder: 'Maliks_Muwataa',
    fileWithDiacritics: 'mawtta_malik_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'mawtta_malik_ahadith.utf8.csv'
  },
  ahmad: {
    folder: 'Musnad_Ahmad_Ibn-Hanbal',
    fileWithDiacritics: 'musnad_ahmad_ibn_hanbal_ahadith_mushakkala.utf8.csv',
    fileWithoutDiacritics: 'musnad_ahmad_ibn_hanbal_ahadith.utf8.csv'
  },
  darimi: {
    folder: 'Sunan_Al-Darimi',
    fileWithDiacritics: 'sunan_al-darimi_ahadith_mushakkala.utf8.csv',
    fileWithoutDiacritics: 'sunan_al-darimi_ahadith.utf8.csv'
  }
};

// Simple CSV parser that handles the specific format
function parseCSV(csvText: string): string[][] {
  const lines = csvText.split('\n');
  const result: string[][] = [];
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    // Split by tab or semicolon (common separators in these files)
    let fields: string[];
    if (line.includes('\t')) {
      fields = line.split('\t');
    } else if (line.includes(';')) {
      fields = line.split(';');
    } else {
      fields = line.split(',');
    }
    
    result.push(fields.map(f => f.trim().replace(/^"|"$/g, '')));
  }
  
  return result;
}

// Fetch and parse hadiths from GitHub
async function fetchHadiths(bookId: string, start: number, limit: number, withDiacritics: boolean = true) {
  const mapping = bookMappings[bookId];
  if (!mapping) {
    throw new Error(`Unknown book: ${bookId}`);
  }

  const fileName = withDiacritics ? mapping.fileWithDiacritics : mapping.fileWithoutDiacritics;
  const url = `${GITHUB_RAW_BASE}/${mapping.folder}/${fileName}`;
  
  console.log(`Fetching from: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'text/csv',
      'User-Agent': 'NoorAlFurqan/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();
  const rows = parseCSV(csvText);
  
  // Skip header row if exists
  const dataRows = rows.slice(1);
  
  // Paginate results
  const end = Math.min(start + limit, dataRows.length);
  const paginatedRows = dataRows.slice(start, end);
  
  // Parse hadiths based on book type (with or without elaboration)
  const hadiths = paginatedRows.map((row, index) => {
    // Format varies by book:
    // With elaboration: id, narrator, hadith_text, elaboration
    // Without elaboration: id, hadith_text
    // Some have: id, narrator, text
    
    const hadithNumber = parseInt(row[0]) || (start + index + 1);
    
    if (row.length >= 4) {
      // With elaboration format
      return {
        id: start + index + 1,
        bookId,
        hadithNumber,
        narrator: row[1] || '',
        text: row[2] || '',
        elaboration: row[3] || ''
      };
    } else if (row.length >= 3) {
      // Narrator + text format
      return {
        id: start + index + 1,
        bookId,
        hadithNumber,
        narrator: row[1] || '',
        text: row[2] || ''
      };
    } else {
      // Simple format
      return {
        id: start + index + 1,
        bookId,
        hadithNumber,
        text: row[1] || row[0] || ''
      };
    }
  });

  return {
    hadiths,
    total: dataRows.length,
    page: Math.floor(start / limit) + 1,
    hasMore: end < dataRows.length
  };
}

// Search within hadiths
async function searchHadiths(bookId: string, query: string, limit: number = 50) {
  const mapping = bookMappings[bookId];
  if (!mapping) {
    throw new Error(`Unknown book: ${bookId}`);
  }

  // Use non-diacritics file for search
  const url = `${GITHUB_RAW_BASE}/${mapping.folder}/${mapping.fileWithoutDiacritics}`;
  
  console.log(`Searching in: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'text/csv',
      'User-Agent': 'NoorAlFurqan/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }

  const csvText = await response.text();
  const rows = parseCSV(csvText);
  const dataRows = rows.slice(1);
  
  // Search for query in the text
  const normalizedQuery = query.toLowerCase();
  const results: any[] = [];
  
  for (let i = 0; i < dataRows.length && results.length < limit; i++) {
    const row = dataRows[i];
    const text = row.join(' ').toLowerCase();
    
    if (text.includes(normalizedQuery)) {
      const hadithNumber = parseInt(row[0]) || (i + 1);
      
      results.push({
        id: i + 1,
        bookId,
        hadithNumber,
        narrator: row.length >= 3 ? row[1] : '',
        text: row.length >= 3 ? row[2] : (row[1] || row[0])
      });
    }
  }

  return {
    results,
    total: results.length,
    query
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'list';
    const bookId = url.searchParams.get('book') || 'bukhari';
    const start = parseInt(url.searchParams.get('start') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const query = url.searchParams.get('q') || '';

    console.log(`Action: ${action}, Book: ${bookId}, Start: ${start}, Limit: ${limit}`);

    let data: any;

    switch (action) {
      case 'fetch':
        data = await fetchHadiths(bookId, start, limit);
        break;
      
      case 'search':
        if (!query) {
          throw new Error('Search query is required');
        }
        data = await searchHadiths(bookId, query, limit);
        break;
      
      case 'books':
        data = Object.keys(bookMappings).map(id => ({
          id,
          ...bookMappings[id]
        }));
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

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
