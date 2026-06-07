import { rowToProposalCase } from "@/lib/proposal/map-case-row";
import type { ProposalCase } from "@/lib/proposal/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProposalCaseRow } from "@/lib/supabase/types";

export type CreateProposalCaseInput = {
  projectName: string;
  client: string;
  location: string;
  schedule: string;
  surveyPurpose: string;
  siteKnownInfo: string;
  surveyPlanOutline: string;
};

export async function listProposalCases(): Promise<ProposalCase[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("proposal_cases")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`案件一覧の取得に失敗しました: ${error.message}`);
  }

  return (data as ProposalCaseRow[]).map(rowToProposalCase);
}

export async function getProposalCaseById(
  id: string
): Promise<ProposalCase | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("proposal_cases")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`案件の取得に失敗しました: ${error.message}`);
  }

  if (!data) return null;

  return rowToProposalCase(data as ProposalCaseRow);
}

export async function createProposalCase(
  input: CreateProposalCaseInput
): Promise<ProposalCase> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("proposal_cases")
    .insert({
      project_name: input.projectName,
      client: input.client,
      location: input.location,
      schedule: input.schedule,
      survey_purpose: input.surveyPurpose,
      site_known_info: input.siteKnownInfo,
      survey_plan_outline: input.surveyPlanOutline,
      assignee_name: "山田 太郎",
      status: "checklist_pending",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`案件の作成に失敗しました: ${error.message}`);
  }

  return rowToProposalCase(data as ProposalCaseRow);
}
