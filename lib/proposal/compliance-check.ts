import { randomUUID } from "node:crypto";

import type {
  ChecklistItem,
  ComplianceItem,
  ComplianceJudgment,
} from "@/lib/proposal/types";

const LABEL_SUFFIX =
  /の(明確性|妥当性|充実|体制|措置|適切性|確認|評価).*$/u;

/** 採点項目ラベルから文案内を検索する語を組み立てる */
export function buildSearchTerms(
  label: string,
  explicitKeywords?: string[]
): string[] {
  if (explicitKeywords && explicitKeywords.length > 0) {
    return [...new Set(explicitKeywords.filter((term) => term.length >= 2))];
  }

  const core = label.replace(LABEL_SUFFIX, "").trim();
  const terms = new Set<string>();

  if (core.length >= 2) terms.add(core);
  if (label.length >= 2) terms.add(label.replace(LABEL_SUFFIX, "").trim());

  for (const part of core.split(/[・／/の]/u)) {
    const trimmed = part.trim();
    if (trimmed.length >= 2) terms.add(trimmed);
  }

  return [...terms].filter((term) => term.length >= 2);
}

type CoverageResult = {
  judgment: ComplianceJudgment;
  evidence: string;
  nextAction?: string;
  matchedTerms: string[];
};

export function judgeChecklistCoverage(
  label: string,
  documentText: string,
  searchKeywords?: string[]
): CoverageResult {
  const terms = buildSearchTerms(label, searchKeywords);
  const matchedTerms = terms.filter((term) => documentText.includes(term));

  if (matchedTerms.length === 0) {
    const hint = terms[0] ?? label;
    return {
      judgment: "missing",
      evidence: `文案内に「${hint}」関連の記述が見つかりませんでした`,
      nextAction: `${label}の記述を追加`,
      matchedTerms,
    };
  }

  const primary = terms[0];
  const hasPrimary = primary ? documentText.includes(primary) : false;
  const matchedDisplay = matchedTerms.slice(0, 3).join("、");

  if (hasPrimary || matchedTerms.length >= 2) {
    return {
      judgment: "ok",
      evidence: `文案に関連語（${matchedDisplay}）の記載あり`,
      matchedTerms,
    };
  }

  return {
    judgment: "partial",
    evidence: `文案に一部のみ記載（${matchedDisplay}）`,
    nextAction: `${label}の根拠を追記`,
    matchedTerms,
  };
}

/** 採点項目と文案テキストから適合チェック結果を生成 */
export function generateComplianceItems(
  checklistItems: ChecklistItem[],
  documentText: string
): ComplianceItem[] {
  if (checklistItems.length === 0) {
    return [
      {
        id: "cp-pilot-skip",
        checklistItemId: "pilot-skip",
        label: "（採点項目なし — パイロット確認用）",
        judgment: "ok",
        evidence: "採点項目未登録のため、適合チェックをスキップしました",
      },
    ];
  }

  const normalizedText = documentText.replace(/\s+/g, " ").trim();

  return checklistItems.map((item) => {
    const result = judgeChecklistCoverage(
      item.label,
      normalizedText,
      item.searchKeywords
    );

    return {
      id: `cp-${randomUUID()}`,
      checklistItemId: item.id,
      label: item.label,
      judgment: result.judgment,
      evidence: result.evidence,
      nextAction: result.nextAction,
    };
  });
}
