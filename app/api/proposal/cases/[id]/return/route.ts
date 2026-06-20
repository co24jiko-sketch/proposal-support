import { NextResponse } from "next/server";

import { returnCase } from "@/lib/proposal/case-repository";
import { getRouteAuthContext, mapRepositoryError } from "@/lib/proposal/route-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const authResult = await getRouteAuthContext();
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { reason?: string };
    const updated = await returnCase(authResult.auth, id, body.reason ?? "");
    return NextResponse.json(updated);
  } catch (error) {
    return mapRepositoryError(error, "差し戻しに失敗しました");
  }
}
