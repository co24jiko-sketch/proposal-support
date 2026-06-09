import { NextResponse } from "next/server";

import { returnCase } from "@/lib/proposal/case-repository";
import type { UserRole } from "@/lib/proposal/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      role?: UserRole;
      reason?: string;
    };

    if (body.role !== "manager" && body.role !== "director") {
      return NextResponse.json(
        { error: "差戻しロールが不正です" },
        { status: 400 }
      );
    }

    const updated = await returnCase(id, body.role, body.reason ?? "");
    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "差し戻しに失敗しました";
    const status = message.includes("見つかりません") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
