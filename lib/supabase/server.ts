import { createClient } from "@supabase/supabase-js";

function sanitizeEnv(value: string | undefined, name: string): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(
      `Supabase の環境変数 ${name} が未設定です。Vercel の Environment Variables を確認してください。`
    );
  }

  const invalid = [...trimmed].find((char) => char.charCodeAt(0) > 255);
  if (invalid) {
    throw new Error(
      `${name} に日本語など不正な文字が含まれています。Vercel の値を .env.local から英数字だけコピーし直してください。`
    );
  }

  return trimmed;
}

export function createSupabaseServerClient() {
  const supabaseUrl = sanitizeEnv(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL"
  );
  const supabaseAnonKey = sanitizeEnv(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );

  return createClient(supabaseUrl, supabaseAnonKey);
}
