import type { ChecklistItem } from "@/lib/proposal/types";

/** PDF 抽出の代わりに学習用サンプル採点項目を返す */
export const SAMPLE_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "cl-1",
    label: "調査方針の明確性",
    points: 10,
    confidence: "high",
  },
  {
    id: "cl-2",
    label: "調査方法の妥当性",
    points: 15,
    confidence: "low",
  },
  {
    id: "cl-3",
    label: "品質管理体制",
    points: 10,
    confidence: "high",
  },
  {
    id: "cl-4",
    label: "安全管理",
    points: 8,
    confidence: "low",
  },
];
