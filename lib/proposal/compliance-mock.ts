import type {
  ChecklistItem,
  ComplianceItem,
  ComplianceJudgment,
} from "@/lib/proposal/types";

function judgmentForItem(
  item: ChecklistItem,
  index: number
): ComplianceJudgment {
  if (item.confidence === "high") return "ok";
  return index % 2 === 0 ? "partial" : "missing";
}

function evidenceFor(judgment: ComplianceJudgment, label: string): string {
  switch (judgment) {
    case "ok":
      return `概要 — ${label}の記載あり`;
    case "partial":
      return `詳細 — ${label}の一部記載あり`;
    case "missing":
      return "該当記述なし";
  }
}

function nextActionFor(judgment: ComplianceJudgment, label: string): string | undefined {
  if (judgment === "partial") return `${label}の根拠を追記`;
  if (judgment === "missing") return `${label}の記述を追加`;
  return undefined;
}

/** Word 再取込後の適合チェック（モック）— 採点項目から結果を生成 */
export function generateMockComplianceItems(
  checklistItems: ChecklistItem[]
): ComplianceItem[] {
  return checklistItems.map((item, index) => {
    const judgment = judgmentForItem(item, index);
    return {
      id: `cp-${item.id}`,
      checklistItemId: item.id,
      label: item.label,
      judgment,
      evidence: evidenceFor(judgment, item.label),
      nextAction: nextActionFor(judgment, item.label),
    };
  });
}
