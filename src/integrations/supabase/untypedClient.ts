import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as typedClient } from "./client";

// Temporary: the newly connected database has no generated table types yet.
// Remove once the schema is recreated there and types are regenerated.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = typedClient as unknown as SupabaseClient<any, "public", any>;
