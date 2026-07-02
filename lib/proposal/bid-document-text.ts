import { extractText, getDocumentProxy } from "unpdf";

const MAX_BID_TEXT_CHARS = 12_000;

export async function extractBidDocumentText(buffer: Buffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= MAX_BID_TEXT_CHARS) {
    return normalized;
  }

  return `${normalized.slice(0, MAX_BID_TEXT_CHARS)}…（以降省略）`;
}
