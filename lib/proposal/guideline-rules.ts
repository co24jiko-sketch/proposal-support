import type { AiDraftSectionKey } from "@/lib/proposal/ai-draft";
import type { DraftSectionsContent } from "@/lib/proposal/types";

export type GuidelineCheckKind = "mechanical" | "ai";

export type GuidelineRule = {
  id: string;
  label: string;
  kind: GuidelineCheckKind;
  /** 対象欄。全体ルールは all */
  section: AiDraftSectionKey | "all";
  description: string;
};

/** 技術提案書の記載要領・作成ルール（固定） */
export const GUIDELINE_RULES: GuidelineRule[] = [
  {
    id: "a4-one-page",
    label: "A4判片面1枚以内に収まる分量",
    kind: "mechanical",
    section: "all",
    description: "4欄合計が様式の1枚分量を大幅に超えないこと",
  },
  {
    id: "no-identifying-info",
    label: "提出者の特定情報を記載しない",
    kind: "mechanical",
    section: "all",
    description:
      "社名・個人名・電話番号・メールアドレス・住所など、提出者を特定できる記述を含めない",
  },
  {
    id: "forbidden-phrases",
    label: "あいまい表現を使わない",
    kind: "mechanical",
    section: "all",
    description: "「必要に応じて」「～に努める」「できる限り」等を含めない",
  },
  {
    id: "summary-concise",
    label: "提案の概要は簡潔に記載されている",
    kind: "ai",
    section: "summary",
    description: "提案を簡潔に記載すること",
  },
  {
    id: "focus-points-quality",
    label: "着目点に留意点・背景・業務との関係がある",
    kind: "ai",
    section: "focusPoints",
    description:
      "品質確保上の留意点・課題等の着目点や、提案に至った背景等を簡潔に記載すること",
  },
  {
    id: "detail-from-focus",
    label: "詳細は着目点を踏まえた具体的内容",
    kind: "ai",
    section: "detail",
    description:
      "着目点を踏まえた方法や手順等の詳細を具体的に記載すること",
  },
  {
    id: "effects-evidence",
    label: "効果に根拠・実績等がある",
    kind: "ai",
    section: "effects",
    description:
      "詳細な内容による効果の他、効果を裏付ける根拠や実績等を具体的に記載すること",
  },
  {
    id: "effects-quantitative",
    label: "効果は定量的（難しければ定性的）に記載されている",
    kind: "ai",
    section: "effects",
    description:
      "効果は定量的に記載し、定量的な記載が難しい場合は定性的に記載すること",
  },
  {
    id: "new-approach-comparison",
    label: "新たな取り組みは従来との比較がある",
    kind: "ai",
    section: "effects",
    description:
      "実績が少ない新たな取り組みについては、これまでの取り組みとの比較等で有効性を説明すること",
  },
];

export const MECHANICAL_GUIDELINE_RULES = GUIDELINE_RULES.filter(
  (rule) => rule.kind === "mechanical"
);

export const AI_GUIDELINE_RULES = GUIDELINE_RULES.filter(
  (rule) => rule.kind === "ai"
);

/** A4 片面1枚の目安（4欄合計・日本語） */
export const A4_ONE_PAGE_CHAR_LIMIT = 1400;

export function getDraftSectionText(
  draft: DraftSectionsContent,
  section: GuidelineRule["section"]
): string {
  if (section === "all") {
    return [draft.summary, draft.focusPoints, draft.detail, draft.effects]
      .join("\n")
      .trim();
  }
  return draft[section].trim();
}

export function getCombinedDraftText(draft: DraftSectionsContent): string {
  return getDraftSectionText(draft, "all");
}
