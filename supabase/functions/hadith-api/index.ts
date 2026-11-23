import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Papa from "npm:papaparse@5.5.3";
import { mapHadithRows, HADITH_CONTENT_VERSION } from "../_shared/hadithRows.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/halimbahae/Hadith/main';

// Correct file mappings based on actual GitHub repo
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
    fileWithDiacritics: 'sunan_abu-dawud_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'sunan_abu-dawud_ahadith.utf8.csv'
  },
  tirmidhi: {
    folder: 'Sunan_Al-Tirmidhi',
    fileWithDiacritics: 'sunan_al-tirmidhi_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'sunan_al-tirmidhi_ahadith.utf8.csv'
  },
  nasai: {
    folder: 'Sunan_Al-Nasai',
    fileWithDiacritics: 'sunan_al-nasai_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'sunan_al-nasai_ahadith.utf8.csv'
  },
  ibnmajah: {
    folder: 'Sunan_Ibn-Maja',
    fileWithDiacritics: 'sunan_ibn-maja_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'sunan_ibn-maja_ahadith.utf8.csv'
  },
  malik: {
    folder: 'Maliks_Muwataa',
    fileWithDiacritics: 'maliks_muwataa_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'maliks_muwataa_ahadith.utf8.csv'
  },
  ahmad: {
    folder: 'Musnad_Ahmad_Ibn-Hanbal',
    fileWithDiacritics: 'musnad_ahmad_ibn-hanbal_ahadith_mushakkala.utf8.csv',
    fileWithoutDiacritics: 'musnad_ahmad_ibn-hanbal_ahadith.utf8.csv'
  },
  darimi: {
    folder: 'Sunan_Al-Darimi',
    fileWithDiacritics: 'sunan_al-darimi_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'sunan_al-darimi_ahadith.utf8.csv'
  }
};

// Standards-compliant parsing preserves quoted punctuation and embedded newlines.
async function loadBook(bookId: string, withDiacritics = true) {
  const mapping = bookMappings[bookId];
  if (!mapping) throw new Error(`Unknown book: ${bookId}`);
  const file = withDiacritics ? mapping.fileWithDiacritics : mapping.fileWithoutDiacritics;
  const response = await fetch(`${GITHUB_RAW_BASE}/${mapping.folder}/${file}`, { headers: { Accept: "text/csv" } });
  if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
  const parsed = Papa.parse<string[]>(await response.text(), { delimiter: ",", skipEmptyLines: true });
  if (parsed.errors.some(error => error.type === "Quotes")) throw new Error("Malformed hadith source");
  return mapHadithRows(parsed.data, bookId);
}

async function fetchHadiths(bookId: string, start: number, limit: number) {
  const all = await loadBook(bookId);
  const end = Math.min(start + limit, all.length);
  return { hadiths: all.slice(start, end), total: all.length, page: Math.floor(start / limit) + 1, hasMore: end < all.length, contentVersion: HADITH_CONTENT_VERSION };
}

const normalizeSearch = (value: string) => value.replace(/[\u064B-\u065F\u0670\u200f]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/\s+/g, " ").trim().toLowerCase();
async function searchHadiths(bookId: string, query: string, limit: number) {
  const all = await loadBook(bookId);
  const terms = normalizeSearch(query).split(" ").filter(Boolean);
  const results = all.filter(hadith => terms.every(term => normalizeSearch(hadith.text).includes(term))).slice(0, limit);
  return { results, total: results.length, query, contentVersion: HADITH_CONTENT_VERSION };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'list';
    const bookId = url.searchParams.get('book') || 'bukhari';
    const start = Math.max(0, parseInt(url.searchParams.get('start') || '0') || 0);
    const limit = Math.max(1, Math.min(500, parseInt(url.searchParams.get('limit') || '50') || 50));
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
      
      case 'lookup': {
        const numbers = new Set((url.searchParams.get('numbers') || '').split(',').map(Number));
        const all = await loadBook(bookId);
        data = { hadiths: all.filter(hadith => numbers.has(hadith.hadithNumber)), contentVersion: HADITH_CONTENT_VERSION };
        break;
      }

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
