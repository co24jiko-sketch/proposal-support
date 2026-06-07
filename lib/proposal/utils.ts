import { getComplianceSummary } from "@/lib/proposal/mock-data";
import type {
  CaseDetailTab,
  CaseStatus,
  ProposalCase,
  UserRole,
  WorkflowStepId,
} from "@/lib/proposal/types";

export const WORKFLOW_STEPS: WorkflowStepId[] = [
  "basic_input",
  "checklist",
  "generate",
  "reimport",
  "approval_request",
  "pdf_export",
];

export const workflowStepToTab: Record<WorkflowStepId, CaseDetailTab> = {
  basic_input: "basic",
  checklist: "checklist",
  generate: "draft",
  reimport: "draft",
  approval_request: "compliance",
  pdf_export: "approval",
};

export function getWorkflowStepIndex(step: WorkflowStepId): number {
  return WORKFLOW_STEPS.indexOf(step);
}

export function isWorkflowStepReachable(
  currentStep: WorkflowStepId,
  step: WorkflowStepId
): boolean {
  return getWorkflowStepIndex(step) <= getWorkflowStepIndex(currentStep);
}

export function getWorkflowStepLockReason(step: WorkflowStepId): string {
  switch (step) {
    case "checklist":
      return "基本情報の入力後に利用できます";
    case "generate":
      return "チェックリストを確定すると利用できます";
    case "reimport":
      return "初稿を生成して Word をダウンロードした後に利用できます";
    case "approval_request":
      return "Word を再取込して適合チェックを完了すると利用できます";
    case "pdf_export":
      return "部長・支社長の承認が完了すると利用できます";
    default:
      return "前のステップを完了してください";
  }
}

export function getTabStatusBadge(
  caseItem: ProposalCase,
  tab: CaseDetailTab
): { label: string; className: string } | null {
  switch (tab) {
    case "checklist":
      return caseItem.checklistConfirmed
        ? { label: "確定済", className: "bg-emerald-100 text-emerald-800" }
        : { label: "未確定", className: "bg-amber-100 text-amber-900" };
    case "draft": {
      if (!caseItem.checklistConfirmed) {
        return { label: "待機中", className: "bg-slate-100 text-slate-600" };
      }
      const generated = Object.values(caseItem.generatedSections).some(Boolean);
      if (!generated) {
        return { label: "未生成", className: "bg-slate-100 text-slate-600" };
      }
      if (caseItem.currentWordVersion) {
        return {
          label: caseItem.currentWordVersion,
          className: "bg-blue-100 text-blue-800",
        };
      }
      return { label: "生成済", className: "bg-emerald-100 text-emerald-800" };
    }
    case "compliance": {
      if (caseItem.complianceItems.length === 0) {
        return { label: "未実行", className: "bg-slate-100 text-slate-600" };
      }
      const summary = getComplianceSummary(caseItem);
      if (summary.partial > 0 || summary.missing > 0) {
        return {
          label: `△${summary.partial} ×${summary.missing}`,
          className: "bg-amber-100 text-amber-900",
        };
      }
      return {
        label: `○${summary.ok}`,
        className: "bg-emerald-100 text-emerald-800",
      };
    }
    case "approval": {
      switch (caseItem.status) {
        case "pending_manager":
          return { label: "部長待ち", className: "bg-orange-100 text-orange-900" };
        case "pending_director":
          return {
            label: "支社長待ち",
            className: "bg-orange-100 text-orange-900",
          };
        case "approved":
          return { label: "承認済", className: "bg-emerald-100 text-emerald-800" };
        case "returned":
          return { label: "差戻", className: "bg-red-100 text-red-800" };
        default:
          return null;
      }
    }
    case "history":
      return caseItem.versions.length > 0
        ? {
            label: `${caseItem.versions.length}版`,
            className: "bg-slate-100 text-slate-600",
          }
        : null;
    default:
      return null;
  }
}

export function canEditCase(role: UserRole, _caseItem: ProposalCase): boolean {
  return role === "assignee" || role === "admin";
}

export function isPendingApprovalForRole(
  role: UserRole,
  caseItem: ProposalCase
): boolean {
  if (role === "manager") return caseItem.status === "pending_manager";
  if (role === "director") return caseItem.status === "pending_director";
  return false;
}

export function getDefaultTabForCase(
  caseItem: ProposalCase,
  role?: UserRole
): CaseDetailTab {
  if (role === "manager" && caseItem.status === "pending_manager") {
    return "approval";
  }
  if (role === "director" && caseItem.status === "pending_director") {
    return "approval";
  }

  switch (caseItem.status) {
    case "checklist_pending":
    case "draft":
      return "checklist";
    case "ready_to_generate":
    case "editing":
    case "returned":
      return "draft";
    case "pending_manager":
    case "pending_director":
    case "approved":
      return "approval";
    default:
      return "basic";
  }
}

export function getCaseDetailHref(
  caseItem: ProposalCase,
  role?: UserRole
): string {
  const tab = getDefaultTabForCase(caseItem, role);
  return `/proposal/cases/${caseItem.id}?tab=${tab}`;
}

export function getNextAction(caseItem: ProposalCase) {
  switch (caseItem.status) {
    case "checklist_pending":
      return {
        label: "チェックリストを確定する",
        tab: "checklist" as const,
        hint: "入札図書PDFの採点項目を確認し、確定してください",
      };
    case "ready_to_generate":
      return {
        label: "初稿を生成する",
        tab: "draft" as const,
        hint: "チェックリスト確定済みです。文案・Wordタブで初稿を生成できます",
      };
    case "editing":
    case "returned":
      return {
        label: "Wordを再取込する",
        tab: "draft" as const,
        hint:
          caseItem.status === "returned"
            ? "差し戻し内容を反映した Word を再取込してください"
            : "手修正済みの Word をアップロードして適合チェックへ進みます",
      };
    case "pending_manager":
    case "pending_director":
      return {
        label: "承認状況を確認",
        tab: "approval" as const,
        hint:
          caseItem.status === "pending_manager"
            ? "部長の承認待ちです"
            : "支社長の承認待ちです",
      };
    case "approved":
      return {
        label: "提出版 PDF を出力",
        tab: "approval" as const,
        hint: "承認が完了しました。提出版 PDF を出力できます",
      };
    default:
      return {
        label: "チェックリストへ進む",
        tab: "checklist" as const,
        hint: "基本情報を確認したら、チェックリストの確定に進みます",
      };
  }
}

export function getStatusBadgeVariant(
  status: CaseStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "approved":
      return "default";
    case "returned":
      return "destructive";
    case "pending_manager":
    case "pending_director":
      return "secondary";
    default:
      return "outline";
  }
}
