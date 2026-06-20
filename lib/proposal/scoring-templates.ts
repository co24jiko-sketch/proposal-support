import { randomUUID } from "node:crypto";

import type { ChecklistConfidence, ChecklistItem } from "@/lib/proposal/types";

export type ScoringTemplateItem = {
  label: string;
  points: number;
  confidence: ChecklistConfidence;
  /** 適合チェックで文案内を検索する語 */
  searchKeywords: string[];
};

export type ScoringTemplate = {
  id: string;
  name: string;
  description: string;
  items: ScoringTemplateItem[];
};

/** 採点基準マスタ（仮）。正式な基準がまとまり次第、ここを差し替えまたは DB 化する */
export const SCORING_TEMPLATES: ScoringTemplate[] = [
  {
    id: "geology-standard",
    name: "地質調査（標準・仮）",
    description:
      "パイロット用の仮マスタです。国交省系の地質調査でよく使う観点を想定しています。",
    items: [
      {
        label: "調査方針の明確性",
        points: 10,
        confidence: "high",
        searchKeywords: ["概要", "提案", "調査", "方針"],
      },
      {
        label: "調査方法の妥当性",
        points: 15,
        confidence: "low",
        searchKeywords: ["詳細", "方法", "計画", "調査"],
      },
      {
        label: "品質管理体制",
        points: 10,
        confidence: "high",
        searchKeywords: ["品質", "管理", "体制"],
      },
      {
        label: "安全管理",
        points: 8,
        confidence: "low",
        searchKeywords: ["安全", "管理", "体制"],
      },
    ],
  },
  {
    id: "tunnel-survey",
    name: "トンネル調査（仮）",
    description:
      "パイロット用プレースホルダーです。トンネル地質調査向けの観点を仮置きしています。",
    items: [
      {
        label: "トンネル調査計画の妥当性",
        points: 12,
        confidence: "low",
        searchKeywords: ["トンネル", "計画", "調査", "詳細"],
      },
      {
        label: "掘進影響を踏まえた調査方法",
        points: 15,
        confidence: "low",
        searchKeywords: ["掘進", "調査", "方法", "詳細"],
      },
      {
        label: "品質・安全管理体制",
        points: 10,
        confidence: "high",
        searchKeywords: ["品質", "安全", "管理", "体制"],
      },
    ],
  },
];

export function getScoringTemplate(id: string): ScoringTemplate | undefined {
  return SCORING_TEMPLATES.find((template) => template.id === id);
}

export function instantiateChecklistItems(template: ScoringTemplate): ChecklistItem[] {
  return template.items.map((item) => ({
    id: `cl-${randomUUID()}`,
    label: item.label,
    points: item.points,
    confidence: item.confidence,
    searchKeywords: item.searchKeywords,
  }));
}
