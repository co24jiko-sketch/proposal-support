import type { ProposalCase } from "@/lib/proposal/types";

export type Form10TemplateData = {
  projectName: string;
  client: string;
  location: string;
  schedule: string;
  evaluationTheme: string;
  proposalAxis: string;
  version: string;
  summary: string;
  focusPoints: string;
  detail: string;
  effects: string;
  technicalReviewNote: string;
};

export function buildForm10TemplateData(caseItem: ProposalCase): Form10TemplateData {
  const { basicInput } = caseItem;
  const draft = caseItem.draftSections;

  return {
    projectName: basicInput.projectName.trim() || "（未入力）",
    client: basicInput.client.trim() || "（未入力）",
    location: basicInput.location.trim() || "（未入力）",
    schedule: basicInput.schedule.trim() || "（未入力）",
    evaluationTheme: caseItem.evaluationTheme.trim() || "（未入力）",
    proposalAxis:
      caseItem.proposalAxisConfirmed?.trim() ||
      caseItem.proposalAxisDraft.trim() ||
      "（未入力）",
    version: caseItem.currentWordVersion ?? "v1",
    summary: draft?.summary?.trim() || basicInput.surveyPurpose.trim() || "（未生成）",
    focusPoints: draft?.focusPoints?.trim() || "（未生成）",
    detail: draft?.detail?.trim() || basicInput.surveyPlanOutline.trim() || "（未生成）",
    effects: draft?.effects?.trim() || "（未生成）",
    technicalReviewNote: draft?.needsTechnicalReview
      ? "※ 要技術者確認: 材料不足または表現の確認が必要です"
      : "",
  };
}
