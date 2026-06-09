export type UserRole = "assignee" | "manager" | "director" | "admin";

export type CaseStatus =
  | "draft"
  | "checklist_pending"
  | "ready_to_generate"
  | "editing"
  | "pending_manager"
  | "pending_director"
  | "approved"
  | "returned";

export type WorkflowStepId =
  | "basic_input"
  | "checklist"
  | "generate"
  | "reimport"
  | "approval_request"
  | "pdf_export";

export type ComplianceJudgment = "ok" | "partial" | "missing";

export type ChecklistConfidence = "high" | "low";

export type CaseDetailTab =
  | "basic"
  | "checklist"
  | "draft"
  | "compliance"
  | "approval"
  | "history";

export interface CaseBasicInput {
  projectName: string;
  client: string;
  location: string;
  schedule: string;
  surveyPurpose: string;
  siteKnownInfo: string;
  surveyPlanOutline: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  points: number;
  confidence: ChecklistConfidence;
}

export interface ComplianceItem {
  id: string;
  checklistItemId: string;
  label: string;
  judgment: ComplianceJudgment;
  evidence: string;
  nextAction?: string;
}

export interface CaseVersion {
  id: string;
  label: string;
  createdAt: string;
  action: string;
}

export interface AuditLogEntry {
  id: string;
  at: string;
  user: string;
  action: string;
  detail?: string;
}

export interface ApprovalRecord {
  approvedAt: string;
  approverName: string;
  comment?: string;
}

export interface ProposalCase {
  id: string;
  projectName: string;
  client: string;
  assigneeName: string;
  assigneeId: string;
  status: CaseStatus;
  formType: string;
  updatedAt: string;
  basicInput: CaseBasicInput;
  checklistConfirmed: boolean;
  checklistItems: ChecklistItem[];
  complianceItems: ComplianceItem[];
  managerApproval: ApprovalRecord | null;
  directorApproval: ApprovalRecord | null;
  approvalRequestReason?: string;
  returnReason?: string;
  versions: CaseVersion[];
  auditLog: AuditLogEntry[];
  referencedLibraryIds: string[];
  bidDocumentName?: string;
  currentWordVersion?: string;
  generatedSections: {
    summary: boolean;
    focusPoints: boolean;
    detail: boolean;
    effects: boolean;
  };
}

export interface LibraryItem {
  id: string;
  title: string;
  branch: string;
  formType: string;
  region: string;
  businessType: string;
  uploadedBy: string;
  uploadedAt: string;
  archived: boolean;
}

export interface ComplianceSummary {
  ok: number;
  partial: number;
  missing: number;
}
