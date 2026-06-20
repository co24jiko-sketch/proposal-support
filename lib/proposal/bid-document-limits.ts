/** Vercel サーバーレスのリクエスト上限（約 4.5MB）に合わせる */
export const MAX_BID_PDF_BYTES = 4 * 1024 * 1024;

export function isPdfUpload(file: {
  name: string;
  contentType?: string;
  type?: string;
}): boolean {
  const contentType = file.contentType ?? file.type ?? "";
  return (
    file.name.toLowerCase().endsWith(".pdf") ||
    contentType === "application/pdf"
  );
}
