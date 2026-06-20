import { NextResponse } from "next/server";

import { uploadBidDocument } from "@/lib/proposal/case-repository";
import { getRouteAuthContext, mapRepositoryError } from "@/lib/proposal/route-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const authResult = await getRouteAuthContext();
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "PDF ファイルを選択してください" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const updated = await uploadBidDocument(authResult.auth, id, {
      name: file.name,
      buffer,
      contentType: file.type,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return mapRepositoryError(error, "入札図書のアップロードに失敗しました");
  }
}
