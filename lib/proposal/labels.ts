import type {
  CaseDetailTab,
  CaseStatus,
  ComplianceJudgment,
  UserRole,
  WorkflowStepId,
} from "@/lib/proposal/types";

export const roleLabels: Record<UserRole, string> = {
  assignee: "地質技術者（主担当）",
  manager: "部長",
  director: "支社長",
  admin: "管理者",
};

export const caseStatusLabels: Record<CaseStatus, string> = {
  draft: "下書き",
  checklist_pending: "チェックリスト未確定",
  ready_to_generate: "生成可能",
  editing: "編集中",
  pending_manager: "部長承認待ち",
  pending_director: "支社長承認待ち",
  approved: "承認済み",
  returned: "差し戻し",
};

export const tabLabels: Record<CaseDetailTab, string> = {
  basic: "基本情報",
  checklist: "チェックリスト",
  draft: "文案・Word",
  compliance: "適合チェック",
  approval: "承認",
  history: "履歴",
};

export const workflowStepLabels: Record<WorkflowStepId, string> = {
  basic_input: "基本入力",
  checklist: "チェックリスト確定",
  generate: "初稿生成",
  reimport: "Word再取込",
  approval_request: "承認申請",
  pdf_export: "PDF出力",
};

export const judgmentLabels: Record<ComplianceJudgment, string> = {
  ok: "○ 十分",
  partial: "△ 要追記",
  missing: "× 未記載",
};

export const APP_NAME = "技術提案書サポート";
