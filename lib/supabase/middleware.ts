import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

const PUBLIC_PATHS = ["/proposal/login", "/auth/callback"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function isProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/proposal") || pathname.startsWith("/api/proposal")
  );
}

/** Supabase SSR が付与するセッション Cookie の有無（未ログイン時の API 往復を省略する） */
function hasSupabaseSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) => {
    return cookie.name.startsWith("sb-") && cookie.name.includes("auth-token");
  });
}

function redirectToLogin(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/proposal/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

const GET_USER_TIMEOUT_MS = 8_000;

async function getUserWithTimeout(
  supabase: ReturnType<typeof createServerClient>
): Promise<{ data: { user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] } }> {
  try {
    return await Promise.race([
      supabase.auth.getUser(),
      new Promise<{ data: { user: null } }>((resolve) => {
        setTimeout(() => resolve({ data: { user: null } }), GET_USER_TIMEOUT_MS);
      }),
    ]);
  } catch {
    return { data: { user: null } };
  }
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公開ページは常に Supabase 往復なし（古い Cookie があってもタイムアウトしない）
  if (isPublicPath(pathname)) {
    return NextResponse.next({ request });
  }

  const hasSessionCookie = hasSupabaseSessionCookie(request);

  // 未ログインの保護ページは即リダイレクト / 401（Supabase 応答待ちをしない）
  if (!hasSessionCookie && isProtectedPath(pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }
    return redirectToLogin(request, pathname);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await getUserWithTimeout(supabase);

  if (!user && isProtectedPath(pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }
    return redirectToLogin(request, pathname);
  }

  return supabaseResponse;
}
