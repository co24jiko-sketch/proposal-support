import { NextResponse } from "next/server";

import { applyScoringTemplate } from "@/lib/proposal/case-repository";
import { getRouteAuthContext, mapRepositoryError } from "@/lib/proposal/route-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const authResult = await getRouteAuthContext();
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { templateId?: string };

    if (!body.templateId) {
      return NextResponse.json(
        { error: "採点基準を選択してください" },
        { status: 400 }
      );
    }

    const updated = await applyScoringTemplate(
      authResult.auth,
      id,
      body.templateId
    );
    return NextResponse.json(updated);
  } catch (error) {
    return mapRepositoryError(error, "採点基準の適用に失敗しました");
  }
}
