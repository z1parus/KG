import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

let client: SupabaseClient | undefined;

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase не сконфигурирован (нет NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY).",
    );
  }
  if (!client) {
    client = createClient(url as string, anonKey as string);
  }
  return client;
}
