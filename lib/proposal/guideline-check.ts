import { GUIDELINE_RULES } from "@/lib/proposal/guideline-rules";
import { runAiGuidelineChecks } from "@/lib/proposal/guideline-check-ai";
import { runMechanicalGuidelineChecks } from "@/lib/proposal/guideline-check-mechanical";
import type { ComplianceItem, DraftSectionsContent } from "@/lib/proposal/types";

/** 4欄の下書きに対して記載ルールチェック（機械 ＋ Claude）を実行 */
export async function generateGuidelineCheckItems(
  draft: DraftSectionsContent
): Promise<ComplianceItem[]> {
  const mechanical = runMechanicalGuidelineChecks(draft);
  const ai = await runAiGuidelineChecks(draft);

  const order = new Map(GUIDELINE_RULES.map((rule, index) => [rule.id, index]));
  return [...mechanical, ...ai].sort(
    (a, b) =>
      (order.get(a.checklistItemId) ?? 0) - (order.get(b.checklistItemId) ?? 0)
  );
}
