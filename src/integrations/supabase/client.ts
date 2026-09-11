import { createClient } from "@supabase/supabase-js";

const env = (import.meta as ImportMeta & {
  env?: Record<string, string | undefined>;
}).env ?? {};
const supabaseUrl = env.VITE_SUPABASE_URL ?? env.SUPABASE_URL;
const supabaseAnonKey =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
