import { NextResponse } from "next/server";

import { extractChecklistFromBid } from "@/lib/proposal/case-repository";
import { getRouteAuthContext, mapRepositoryError } from "@/lib/proposal/route-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const authResult = await getRouteAuthContext();
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const updated = await extractChecklistFromBid(authResult.auth, id);
    return NextResponse.json(updated);
  } catch (error) {
    return mapRepositoryError(error, "採点項目の抽出に失敗しました");
  }
}
