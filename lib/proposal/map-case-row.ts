import type { ProposalCaseRow } from "@/lib/supabase/types";
import type { CaseStatus, ProposalCase } from "@/lib/proposal/types";

function formatDate(iso: string): string {
  return iso.slice(0, 10);
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
    checklistConfirmed: false,
    checklistItems: [],
    complianceItems: [],
    managerApproval: null,
    directorApproval: null,
    versions: [],
    auditLog: [],
    referencedLibraryIds: [],
    generatedSections: {
      summary: false,
      focusPoints: false,
      detail: false,
      effects: false,
    },
  };
}
