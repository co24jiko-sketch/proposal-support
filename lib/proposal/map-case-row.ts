import type { ProposalCaseRow } from "@/lib/supabase/types";
import type {
  ApprovalRecord,
  CaseStatus,
  ChecklistItem,
  ComplianceItem,
  ProposalCase,
} from "@/lib/proposal/types";

const DEFAULT_GENERATED_SECTIONS = {
  summary: false,
  focusPoints: false,
  detail: false,
  effects: false,
} as const;

function parseChecklistItems(value: unknown): ChecklistItem[] {
  if (!Array.isArray(value)) return [];
  return value as ChecklistItem[];
}

function parseComplianceItems(value: unknown): ComplianceItem[] {
  if (!Array.isArray(value)) return [];
  return value as ComplianceItem[];
}

function parseGeneratedSections(
  value: unknown
): ProposalCase["generatedSections"] {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_GENERATED_SECTIONS };
  }
  const row = value as Record<string, unknown>;
  return {
    summary: row.summary === true,
    focusPoints: row.focusPoints === true,
    detail: row.detail === true,
    effects: row.effects === true,
  };
}

function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

function toApprovalRecord(
  approvedAt?: string | null,
  approverName?: string | null,
  comment?: string | null
): ApprovalRecord | null {
  if (!approvedAt || !approverName) return null;
  return {
    approvedAt: formatDate(approvedAt),
    approverName,
    comment: comment ?? undefined,
  };
}

const CHECKLIST_CONFIRMED_STATUSES: CaseStatus[] = [
  "ready_to_generate",
  "editing",
  "pending_manager",
  "pending_director",
  "approved",
  "returned",
];

function isChecklistConfirmed(row: ProposalCaseRow): boolean {
  if (row.checklist_confirmed != null) {
    return row.checklist_confirmed;
  }
  return CHECKLIST_CONFIRMED_STATUSES.includes(row.status as CaseStatus);
}

export function rowToProposalCase(row: ProposalCaseRow): ProposalCase {
  return {
    id: row.id,
    projectName: row.project_name,
    client: row.client,
    assigneeName: row.assignee_name,
    assigneeId: "user-yamada",
    status: row.status as CaseStatus,
    formType: row.form_type,
    updatedAt: formatDate(row.updated_at),
    basicInput: {
      projectName: row.project_name,
      client: row.client,
      location: row.location,
      schedule: row.schedule,
      surveyPurpose: row.survey_purpose,
      siteKnownInfo: row.site_known_info,
      surveyPlanOutline: row.survey_plan_outline,
    },
    checklistConfirmed: isChecklistConfirmed(row),
    checklistItems: parseChecklistItems(row.checklist_items),
    complianceItems: parseComplianceItems(row.compliance_items),
    managerApproval: toApprovalRecord(
      row.manager_approved_at,
      row.manager_approver_name,
      row.manager_approval_comment
    ),
    directorApproval: toApprovalRecord(
      row.director_approved_at,
      row.director_approver_name,
      row.director_approval_comment
    ),
    approvalRequestReason: row.approval_request_reason ?? undefined,
    returnReason: row.return_reason ?? undefined,
    versions: [],
    auditLog: [],
    referencedLibraryIds: [],
    currentWordVersion: row.current_word_version ?? undefined,
    wordFilePath: row.word_file_path ?? undefined,
    pdfFilePath: row.pdf_file_path ?? undefined,
    generatedSections: parseGeneratedSections(row.generated_sections),
  };
}
