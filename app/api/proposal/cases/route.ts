import { NextResponse } from "next/server";

import {
  createProposalCase,
  listProposalCases,
} from "@/lib/proposal/case-repository";

export async function GET() {
  try {
    const cases = await listProposalCases();
    return NextResponse.json(cases);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "案件一覧の取得に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await createProposalCase({
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
    const message =
      error instanceof Error ? error.message : "案件の作成に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
