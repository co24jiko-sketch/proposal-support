import { NextResponse } from "next/server";

import {
  createProposalCase,
  listProposalCases,
} from "@/lib/proposal/case-repository";
import { getRouteAuthContext, mapRepositoryError } from "@/lib/proposal/route-auth";

export async function GET() {
  const authResult = await getRouteAuthContext();
  if (!authResult.ok) return authResult.response;

  try {
    const cases = await listProposalCases();
    return NextResponse.json(cases);
  } catch (error) {
    return mapRepositoryError(error, "案件一覧の取得に失敗しました");
  }
}

export async function POST(request: Request) {
  const authResult = await getRouteAuthContext();
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const created = await createProposalCase(authResult.auth, {
      projectName: body.projectName ?? "",
      client: body.client ?? "",
      location: body.location ?? "",
      schedule: body.schedule ?? "",
      surveyPurpose: body.surveyPurpose ?? "",
      siteKnownInfo: body.siteKnownInfo ?? "",
      surveyPlanOutline: body.surveyPlanOutline ?? "",
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return mapRepositoryError(error, "案件の作成に失敗しました");
  }
}
