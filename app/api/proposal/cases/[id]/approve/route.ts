import { NextResponse } from "next/server";

import { approveCase } from "@/lib/proposal/case-repository";
import { getRouteAuthContext, mapRepositoryError } from "@/lib/proposal/route-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const authResult = await getRouteAuthContext();
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { comment?: string };
    const updated = await approveCase(authResult.auth, id, body.comment);
    return NextResponse.json(updated);
  } catch (error) {
    return mapRepositoryError(error, "承認に失敗しました");
  }
}
