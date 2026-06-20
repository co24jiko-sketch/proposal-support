import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/** @deprecated createSupabaseBrowserClient を使用してください */
export function createSupabaseClient() {
  return createSupabaseBrowserClient();
}
