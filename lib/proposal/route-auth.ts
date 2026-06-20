import { NextResponse } from "next/server";

import { isAuthContext, requireAuthContext } from "@/lib/proposal/auth";

export async function getRouteAuthContext() {
  const auth = await requireAuthContext();
  if (!isAuthContext(auth)) {
    return { ok: false as const, response: auth };
  }
  return { ok: true as const, auth };
}

export function mapRepositoryError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  if (message.includes("見つかりません")) {
    return NextResponse.json({ error: message }, { status: 404 });
  }
  if (message.includes("権限") || message.includes("操作する権限")) {
    return NextResponse.json({ error: message }, { status: 403 });
  }
  if (
    message.includes("状態ではありません") ||
    message.includes("入力してください") ||
    message.includes("確定して") ||
    message.includes("生成して")
  ) {
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ error: message }, { status: 500 });
}
