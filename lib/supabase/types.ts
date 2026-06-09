export interface ProposalCaseRow {
  id: string;
  project_name: string;
  client: string;
  location: string;
  schedule: string;
  survey_purpose: string;
  site_known_info: string;
  survey_plan_outline: string;
  assignee_name: string;
  status: string;
  checklist_confirmed?: boolean;
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
