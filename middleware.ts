import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/api/proposal/:path*",
    "/auth/callback",
    "/proposal",
    // /proposal/login は除外（middleware を通さず 504 を防ぐ）
    "/proposal/((?!login$).*)",
  ],
};
