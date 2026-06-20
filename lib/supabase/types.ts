import type {
  ChecklistItem,
  ComplianceItem,
} from "@/lib/proposal/types";

export interface GeneratedSectionsRow {
  summary: boolean;
  focusPoints: boolean;
  detail: boolean;
  effects: boolean;
}

export interface ProposalProfileRow {
  id: string;
  display_name: string;
  role: string;
  org: string;
  created_at: string;
  updated_at: string;
}

export interface ProposalCaseRow {
  id: string;
  project_name: string;
  client: string;
  assignee_id?: string | null;
  location: string;
  schedule: string;
  survey_purpose: string;
  site_known_info: string;
  survey_plan_outline: string;
  assignee_name: string;
  status: string;
  checklist_confirmed?: boolean;
  checklist_items?: ChecklistItem[] | null;
  compliance_items?: ComplianceItem[] | null;
  generated_sections?: GeneratedSectionsRow | null;
  current_word_version?: string | null;
  word_file_path?: string | null;
  pdf_file_path?: string | null;
  bid_document_name?: string | null;
  bid_file_path?: string | null;
  approval_request_reason?: string | null;
  return_reason?: string | null;
  manager_approved_at?: string | null;
  manager_approver_name?: string | null;
  manager_approval_comment?: string | null;
  director_approved_at?: string | null;
  director_approver_name?: string | null;
  director_approval_comment?: string | null;
  form_type: string;
  created_at: string;
  updated_at: string;
}
