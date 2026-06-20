import { NextResponse } from "next/server";

import { getProposalCaseById } from "@/lib/proposal/case-repository";
import { createSignedDownloadUrl } from "@/lib/proposal/file-storage";
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

    if (!caseItem.pdfFilePath) {
      return NextResponse.json(
        { error: "PDF ファイルがまだ生成されていません" },
        { status: 404 }
      );
    }

    const filename = `${caseItem.projectName}-submission.pdf`;
    const signedUrl = await createSignedDownloadUrl(caseItem.pdfFilePath, filename);

    return NextResponse.redirect(signedUrl);
  } catch (error) {
    return mapRepositoryError(error, "PDF のダウンロードに失敗しました");
  }
}
