import type { ProposalCase } from "@/lib/proposal/types";

export type DraftReadinessLevel = "required" | "recommended";

export type DraftReadinessItem = {
  id: string;
  label: string;
  level: DraftReadinessLevel;
  ok: boolean;
  hint?: string;
};

export type DraftReadiness = {
  items: DraftReadinessItem[];
  /** 評価テーマあり案件は厳格チェック */
  usesStrictChecklist: boolean;
  requiredComplete: boolean;
  hasRecommendedGaps: boolean;
  canGenerate: boolean;
  blockReason: string | null;
};

function hasBasicInfo(caseItem: ProposalCase): boolean {
  const { basicInput } = caseItem;
  return Boolean(
    basicInput.projectName.trim() &&
      basicInput.client.trim() &&
      basicInput.location.trim() &&
      basicInput.surveyPurpose.trim()
  );
}

function hasSiteContext(caseItem: ProposalCase): boolean {
  const { basicInput } = caseItem;
  return Boolean(
    basicInput.siteKnownInfo.trim() && basicInput.surveyPlanOutline.trim()
  );
}

export function getDraftReadiness(
  caseItem: ProposalCase,
  llmStopped: boolean
): DraftReadiness {
  const usesStrictChecklist = Boolean(caseItem.evaluationTheme.trim());

  if (!caseItem.checklistConfirmed) {
    return {
      items: [],
      usesStrictChecklist,
      requiredComplete: false,
      hasRecommendedGaps: false,
      canGenerate: false,
      blockReason: "チェックリストを確定すると、初稿の生成が利用できます",
    };
  }

  if (llmStopped) {
    return {
      items: [],
      usesStrictChecklist,
      requiredComplete: false,
      hasRecommendedGaps: false,
      canGenerate: false,
      blockReason: "LLMサービス停止中のため、文案の生成は利用できません",
    };
  }

  if (!usesStrictChecklist) {
    return {
      items: [],
      usesStrictChecklist: false,
      requiredComplete: true,
      hasRecommendedGaps: false,
      canGenerate: true,
      blockReason: null,
    };
  }

  const items: DraftReadinessItem[] = [
    {
      id: "evaluation-theme",
      label: "評価テーマが入力されている",
      level: "required",
      ok: Boolean(caseItem.evaluationTheme.trim()),
    },
    {
      id: "basic-info",
      label: "発注者・件名・場所・目的が入力されている",
      level: "required",
      ok: hasBasicInfo(caseItem),
    },
    {
      id: "bid-document",
      label: "入札図書 PDF がアップロードされている",
      level: "required",
      ok: Boolean(caseItem.bidFilePath),
      hint: "留意事項テキスト欄は今後追加予定です",
    },
    {
      id: "proposal-axis",
      label: "提案の軸が確定している",
      level: "required",
      ok: Boolean(caseItem.proposalAxisConfirmed?.trim()),
      hint: "チェックリストタブで確定してください",
    },
    {
      id: "site-context",
      label: "既知の地質情報・調査計画の骨子がある",
      level: "recommended",
      ok: hasSiteContext(caseItem),
      hint: "空のままでも生成できますが、文案の具体性が弱くなります",
    },
  ];

  const requiredItems = items.filter((item) => item.level === "required");
  const requiredComplete = requiredItems.every((item) => item.ok);
  const hasRecommendedGaps = items
    .filter((item) => item.level === "recommended")
    .some((item) => !item.ok);

  let blockReason: string | null = null;
  if (!requiredComplete) {
    const firstMissing = requiredItems.find((item) => !item.ok);
    blockReason = firstMissing
      ? `文案生成の準備が足りません: ${firstMissing.label}`
      : "文案生成の準備が足りません";
  }

  return {
    items,
    usesStrictChecklist: true,
    requiredComplete,
    hasRecommendedGaps,
    canGenerate: requiredComplete,
    blockReason,
  };
}

export function assertDraftReadiness(caseItem: ProposalCase): void {
  const readiness = getDraftReadiness(caseItem, false);
  if (!readiness.canGenerate && readiness.blockReason) {
    throw new Error(readiness.blockReason);
  }
}
