import { NextResponse } from "next/server";

import { runComplianceCheck } from "@/lib/proposal/case-repository";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const updated = await runComplianceCheck(id);
    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "適合チェック結果の保存に失敗しました";
    const status = message.includes("見つかりません") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
