import { randomUUID } from "node:crypto";

import { extractText, getDocumentProxy } from "unpdf";

import type { ChecklistConfidence, ChecklistItem } from "@/lib/proposal/types";

type ParsedCandidate = {
  label: string;
  points: number;
  confidence: ChecklistConfidence;
};

const SKIP_LINE =
  /^(配点|合計|小計|点|ページ|page|―|－|-|※|注|番号|No\.?|目次|別紙|様式)/i;

const SECTION_MARKERS = [
  "評価の着眼点",
  "評価の観点",
  "評価の方法",
  "評価基準",
  "技術提案書の評価",
  "技術提案書に係る評価",
  "提案内容の評価",
  "加点基準",
  "加点について",
  "選択理由",
  "審査の着眼点",
  "審査基準",
];

const CRITERIA_HINTS =
  /妥当性|適切性|管理体制|安全性|計画|方法|体制|実績|提案|調査|品質|安全|効率|組織|経験|措置|対応|実施|内容|方針|手順|精度|確保|維持|管理|評価/;

const POINT_SUFFIX = /^(.+?)[\s　]+(\d{1,3})\s*点\s*$/;
const NUMBERED_ITEM =
  /^[\s\d①②③④⑤⑥⑦⑧⑨⑩]+[\.．、)\）]\s*(.+?)[\s　]+(\d{1,3})\s*点\s*$/;
const PAREN_POINTS = /^(.+?)[\s　]*[（(](\d{1,3})[)）]\s*点?\s*$/;
const TAB_SEPARATED = /^(.{2,50}?)\s{2,}(\d{1,3})\s*$/;

const PROSE_PREFIX =
  /^[\(（]?[アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺa-zA-Z][\)）\.．、\s　]+(.+)$/;
const BULLET_ITEM = /^[・●■○◆▪\-]\s*(.+)$/;
const NUMBERED_PROSE = /^[\(（]?\d+[\)）\.．、]\s*(.+)$/;
const CIRCLED_NUMBER = /^[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮]\s*(.+)$/;

function normalizeLine(line: string): string {
  return line.replace(/\u3000/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeLabel(label: string): string {
  return normalizeLine(label)
    .replace(/[。．]+\s*$/, "")
    .replace(/について(確認|評価)すること$/u, "")
    .trim();
}

function isPlausibleLabel(label: string, options?: { allowLong?: boolean }): boolean {
  const maxLength = options?.allowLong ? 120 : 60;
  if (label.length < 4 || label.length > maxLength) return false;
  if (SKIP_LINE.test(label)) return false;
  if (/^\d+$/.test(label)) return false;
  if (!/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(label)) {
    return false;
  }
  return true;
}

function isPlausiblePoints(points: number): boolean {
  return points >= 1 && points <= 100;
}

function extractPointsFromText(text: string): number | null {
  const patterns = [
    /(\d{1,3})\s*点/u,
    /配点\s*(\d{1,3})/u,
    /[（(](\d{1,3})[)）]\s*点?/u,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const points = Number.parseInt(match[1], 10);
    if (isPlausiblePoints(points)) return points;
  }

  return null;
}

function parseStructuredLine(line: string): ParsedCandidate | null {
  const normalized = normalizeLine(line);
  if (!normalized || normalized.length < 4) return null;

  const attempts: Array<{
    match: RegExpMatchArray | null;
    confidence: ChecklistConfidence;
  }> = [
    { match: normalized.match(NUMBERED_ITEM), confidence: "high" },
    { match: normalized.match(POINT_SUFFIX), confidence: "high" },
    { match: normalized.match(PAREN_POINTS), confidence: "low" },
    { match: normalized.match(TAB_SEPARATED), confidence: "low" },
  ];

  for (const { match, confidence } of attempts) {
    if (!match) continue;

    const label = normalizeLabel(match[1]);
    const points = Number.parseInt(match[2], 10);

    if (!isPlausibleLabel(label) || !isPlausiblePoints(points)) continue;

    return { label, points, confidence };
  }

  return null;
}

function parseProseLine(line: string, inEvaluationSection: boolean): ParsedCandidate | null {
  const normalized = normalizeLine(line);
  if (!normalized || normalized.length < 4) return null;

  const structured = parseStructuredLine(normalized);
  if (structured) return structured;

  const prefixMatches = [
    normalized.match(PROSE_PREFIX),
    normalized.match(BULLET_ITEM),
    normalized.match(NUMBERED_PROSE),
    normalized.match(CIRCLED_NUMBER),
  ];

  let label: string | null = null;
  for (const match of prefixMatches) {
    if (match?.[1]) {
      label = normalizeLabel(match[1]);
      break;
    }
  }

  if (!label && inEvaluationSection && CRITERIA_HINTS.test(normalized)) {
    label = normalizeLabel(normalized);
  }

  if (!label || !isPlausibleLabel(label, { allowLong: true })) return null;

  const points = extractPointsFromText(normalized) ?? 1;

  return {
    label,
    points,
    confidence: extractPointsFromText(normalized) ? "low" : "low",
  };
}

function lineHasSectionMarker(line: string): boolean {
  const normalized = normalizeLine(line);
  return SECTION_MARKERS.some((marker) => normalized.includes(marker));
}

function collectEvaluationSections(text: string): Set<number> {
  const lines = text.split(/\r?\n/);
  const sectionLineIndexes = new Set<number>();

  for (let index = 0; index < lines.length; index += 1) {
    if (!lineHasSectionMarker(lines[index])) continue;

    const end = Math.min(lines.length, index + 40);
    for (let cursor = index; cursor < end; cursor += 1) {
      sectionLineIndexes.add(cursor);
    }
  }

  return sectionLineIndexes;
}

function addCandidate(
  items: ChecklistItem[],
  seen: Set<string>,
  candidate: ParsedCandidate
): void {
  const key = candidate.label;
  if (seen.has(key)) return;
  seen.add(key);

  items.push({
    id: `cl-${randomUUID()}`,
    label: candidate.label,
    points: candidate.points,
    confidence: candidate.confidence,
  });
}

function parseStructuredItems(text: string): ChecklistItem[] {
  const seen = new Set<string>();
  const items: ChecklistItem[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const parsed = parseStructuredLine(rawLine);
    if (!parsed) continue;
    addCandidate(items, seen, parsed);
  }

  return items;
}

function parseProseItems(text: string): ChecklistItem[] {
  const lines = text.split(/\r?\n/);
  const evaluationSections = collectEvaluationSections(text);
  const seen = new Set<string>();
  const items: ChecklistItem[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const inEvaluationSection = evaluationSections.has(index);
    const parsed = parseProseLine(lines[index], inEvaluationSection);
    if (!parsed) continue;
    addCandidate(items, seen, parsed);
  }

  if (items.length > 0) return items;

  for (const rawLine of lines) {
    const parsed = parseProseLine(rawLine, false);
    if (!parsed) continue;
    if (!PROSE_PREFIX.test(normalizeLine(rawLine)) && !CIRCLED_NUMBER.test(normalizeLine(rawLine))) {
      continue;
    }
    addCandidate(items, seen, parsed);
  }

  return items;
}

/** 抽出テキストから採点項目をパース（単体テスト用に export） */
export function parseChecklistItemsFromText(text: string): ChecklistItem[] {
  const structured = parseStructuredItems(text);
  if (structured.length > 0) return structured;
  return parseProseItems(text);
}

export async function extractChecklistItemsFromPdf(
  pdfBuffer: Buffer
): Promise<ChecklistItem[]> {
  const pdf = await getDocumentProxy(new Uint8Array(pdfBuffer));
  const { text } = await extractText(pdf, { mergePages: true });
  const merged = text.trim();

  if (!merged) {
    throw new Error(
      "PDF からテキストを読み取れませんでした。スキャン画像のみの PDF の可能性があります"
    );
  }

  const items = parseChecklistItemsFromText(merged);
  if (items.length === 0) {
    throw new Error(
      "採点項目らしい記述を PDF から見つけられませんでした。配点表がない文書では抽出精度が下がります。サンプル項目の追加を検討してください"
    );
  }

  return items;
}
