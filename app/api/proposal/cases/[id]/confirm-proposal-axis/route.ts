import { NextResponse } from "next/server";

import { confirmProposalAxis } from "@/lib/proposal/case-repository";
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
      confirmedAxis?: string;
    };
    const updated = await confirmProposalAxis(
      authResult.auth,
      id,
      body.confirmedAxis ?? ""
    );
    return NextResponse.json(updated);
  } catch (error) {
    return mapRepositoryError(error, "提案の軸の確定に失敗しました");
  }
}
