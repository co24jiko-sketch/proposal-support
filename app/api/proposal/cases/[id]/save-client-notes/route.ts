import { NextResponse } from "next/server";

import { saveClientNotesText } from "@/lib/proposal/case-repository";
import { getRouteAuthContext, mapRepositoryError } from "@/lib/proposal/route-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const authResult = await getRouteAuthContext();
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as {
      clientNotesText?: string;
    };
    const updated = await saveClientNotesText(
      authResult.auth,
      id,
      body.clientNotesText ?? ""
    );
    return NextResponse.json(updated);
  } catch (error) {
    return mapRepositoryError(error, "留意事項テキストの保存に失敗しました");
  }
}
