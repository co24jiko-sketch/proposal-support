import { NextResponse } from "next/server";

import { generateDraft } from "@/lib/proposal/case-repository";
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
      llmStopped?: boolean;
    };
    const updated = await generateDraft(authResult.auth, id, {
      llmStopped: body.llmStopped === true,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return mapRepositoryError(error, "初稿生成の保存に失敗しました");
  }
}
