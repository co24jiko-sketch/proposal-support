import { NextResponse } from "next/server";

import { approveCase } from "@/lib/proposal/case-repository";
import type { UserRole } from "@/lib/proposal/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      role?: UserRole;
      comment?: string;
    };

    if (body.role !== "manager" && body.role !== "director") {
      return NextResponse.json(
        { error: "承認ロールが不正です" },
        { status: 400 }
      );
    }

    const updated = await approveCase(id, body.role, body.comment);
    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "承認に失敗しました";
    const status = message.includes("見つかりません") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
