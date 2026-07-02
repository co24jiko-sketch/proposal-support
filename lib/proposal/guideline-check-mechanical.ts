import { FORBIDDEN_DRAFT_PHRASES, findForbiddenPhrases } from "@/lib/proposal/ai-draft";
import {
  A4_ONE_PAGE_CHAR_LIMIT,
  getCombinedDraftText,
  getDraftSectionText,
  type GuidelineRule,
} from "@/lib/proposal/guideline-rules";
import type {
  ComplianceItem,
  ComplianceJudgment,
  DraftSectionsContent,
} from "@/lib/proposal/types";

const IDENTIFYING_PATTERNS: Array<{ id: string; label: string; pattern: RegExp }> =
  [
    {
      id: "email",
      label: "メールアドレス",
      pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/u,
    },
    {
      id: "phone",
      label: "電話番号",
      pattern: /(?:0\d{1,4}-\d{1,4}-\d{3,4}|\d{10,11})/u,
    },
    {
      id: "postal",
      label: "郵便番号付き住所",
      pattern: /〒?\s*\d{3}-\d{4}/u,
    },
    {
      id: "company",
      label: "社名",
      pattern: /(?:株式会社|有限会社|合同会社|（株）|\(株\))/u,
    },
  ];

function toComplianceItem(
  rule: GuidelineRule,
  judgment: ComplianceJudgment,
  evidence: string,
  nextAction?: string
): ComplianceItem {
  return {
    id: `gl-${rule.id}`,
    checklistItemId: rule.id,
    label: rule.label,
    judgment,
    evidence,
    nextAction,
  };
}

function checkForbiddenPhrases(
  rule: GuidelineRule,
  draft: DraftSectionsContent
): ComplianceItem {
  const text = getCombinedDraftText(draft);
  const found = findForbiddenPhrases(text);

  if (found.length === 0) {
    return toComplianceItem(
      rule,
      "ok",
      "禁止されているあいまい表現は検出されませんでした"
    );
  }

  return toComplianceItem(
    rule,
    "missing",
    `禁止表現を検出: ${found.join("、")}`,
    "断定的・具体的な表現に修正してください"
  );
}

function checkIdentifyingInfo(
  rule: GuidelineRule,
  draft: DraftSectionsContent
): ComplianceItem {
  const text = getCombinedDraftText(draft);
  const hits = IDENTIFYING_PATTERNS.filter(({ pattern }) => pattern.test(text));

  if (hits.length === 0) {
    return toComplianceItem(
      rule,
      "ok",
      "提出者を特定しうる社名・連絡先・住所らしき記述は検出されませんでした"
    );
  }

  return toComplianceItem(
    rule,
    "missing",
    `特定情報の可能性: ${hits.map((hit) => hit.label).join("、")}`,
    "社名・個人名・電話・メール・住所などを削除または匿名化してください"
  );
}

function checkA4OnePage(
  rule: GuidelineRule,
  draft: DraftSectionsContent
): ComplianceItem {
  const length = getCombinedDraftText(draft).length;

  if (length <= A4_ONE_PAGE_CHAR_LIMIT) {
    return toComplianceItem(
      rule,
      "ok",
      `4欄合計 ${length} 文字（目安 ${A4_ONE_PAGE_CHAR_LIMIT} 文字以内）`
    );
  }

  if (length <= A4_ONE_PAGE_CHAR_LIMIT * 1.15) {
    return toComplianceItem(
      rule,
      "partial",
      `4欄合計 ${length} 文字で、A4片面1枚の目安をやや超過しています`,
      "冗長な表現を削り、1枚に収まる分量に調整してください"
    );
  }

  return toComplianceItem(
    rule,
    "missing",
    `4欄合計 ${length} 文字で、A4片面1枚の目安（${A4_ONE_PAGE_CHAR_LIMIT} 文字）を大幅に超過しています`,
    "各欄を簡潔にし、1枚に収まる分量に削減してください"
  );
}

export function runMechanicalGuidelineChecks(
  draft: DraftSectionsContent
): ComplianceItem[] {
  return [
    checkA4OnePage(
      {
        id: "a4-one-page",
        label: "A4判片面1枚以内に収まる分量",
        kind: "mechanical",
        section: "all",
        description: "",
      },
      draft
    ),
    checkIdentifyingInfo(
      {
        id: "no-identifying-info",
        label: "提出者の特定情報を記載しない",
        kind: "mechanical",
        section: "all",
        description: "",
      },
      draft
    ),
    checkForbiddenPhrases(
      {
        id: "forbidden-phrases",
        label: "あいまい表現を使わない",
        kind: "mechanical",
        section: "all",
        description: "",
      },
      draft
    ),
  ];
}

export { FORBIDDEN_DRAFT_PHRASES };
