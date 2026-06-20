import { proposalPdfFilename } from "@/lib/proposal/filenames";

/** 日本語ファイル名を正しく付けて PDF をダウンロード */
export async function downloadProposalPdf(caseId: string): Promise<void> {
  const metaResponse = await fetch(
    `/api/proposal/cases/${caseId}/download-pdf?format=json`
  );

  if (!metaResponse.ok) {
    const body = (await metaResponse.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "PDF のダウンロードに失敗しました");
  }

  const { url, filename } = (await metaResponse.json()) as {
    url: string;
    filename: string;
  };

  const fileResponse = await fetch(url);
  if (!fileResponse.ok) {
    throw new Error("PDF の取得に失敗しました");
  }

  const blob = await fileResponse.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
