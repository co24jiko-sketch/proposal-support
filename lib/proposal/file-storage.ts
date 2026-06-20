import { createSupabaseServerClient } from "@/lib/supabase/server";

export const PROPOSAL_FILES_BUCKET = "proposal-files";

export function wordObjectPath(caseId: string, version: string): string {
  return `cases/${caseId}/proposal-${version}.docx`;
}

export function pdfObjectPath(caseId: string): string {
  return `cases/${caseId}/submission.pdf`;
}

export function bidObjectPath(caseId: string): string {
  return `cases/${caseId}/bid-document.pdf`;
}

export async function uploadProposalFile(
  path: string,
  body: Buffer | string,
  contentType: string
): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const buffer = typeof body === "string" ? Buffer.from(body, "utf8") : body;

  const { error } = await supabase.storage
    .from(PROPOSAL_FILES_BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`ファイルのアップロードに失敗しました: ${error.message}`);
  }

  return path;
}

export async function downloadProposalFile(path: string): Promise<{
  data: Blob;
  contentType: string;
}> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(PROPOSAL_FILES_BUCKET)
    .download(path);

  if (error || !data) {
    throw new Error(`ファイルの取得に失敗しました: ${error?.message ?? path}`);
  }

  return {
    data,
    contentType: data.type || "application/octet-stream",
  };
}

export async function createSignedReadUrl(
  path: string,
  expiresInSeconds = 3600
): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(PROPOSAL_FILES_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(
      `署名付き URL の生成に失敗しました: ${error?.message ?? path}`
    );
  }

  return data.signedUrl;
}

export async function getPublicFileUrl(path: string): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data } = supabase.storage
    .from(PROPOSAL_FILES_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}
