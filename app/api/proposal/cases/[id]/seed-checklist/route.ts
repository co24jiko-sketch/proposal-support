import { NextResponse } from "next/server";

import { seedChecklistItems } from "@/lib/proposal/case-repository";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const updated = await seedChecklistItems(id);
    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "採点項目の追加に失敗しました";
    const status = message.includes("見つかりません") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
