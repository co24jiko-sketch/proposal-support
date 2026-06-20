import mammoth from "mammoth";

/** Storage 上の .docx からプレーンテキストを抽出 */
export async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.replace(/\s+/g, " ").trim();
}
