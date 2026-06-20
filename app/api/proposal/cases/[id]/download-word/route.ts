import { NextResponse } from "next/server";

import { getProposalCaseById } from "@/lib/proposal/case-repository";
import { downloadProposalFile } from "@/lib/proposal/file-storage";
import { getRouteAuthContext, mapRepositoryError } from "@/lib/proposal/route-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await getRouteAuthContext();
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const caseItem = await getProposalCaseById(id);

    if (!caseItem) {
      return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
    }

    if (!caseItem.wordFilePath) {
      return NextResponse.json(
        { error: "Word ファイルがまだ生成されていません" },
        { status: 404 }
      );
    }

    const { data, contentType } = await downloadProposalFile(caseItem.wordFilePath);
    const buffer = Buffer.from(await data.arrayBuffer());
    const filename = `${caseItem.projectName}-${caseItem.currentWordVersion ?? "draft"}.docx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (error) {
    return mapRepositoryError(error, "Word のダウンロードに失敗しました");
  }
}
