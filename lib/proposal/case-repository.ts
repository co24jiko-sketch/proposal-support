import { rowToProposalCase } from "@/lib/proposal/map-case-row";
import type { ProposalCase, UserRole } from "@/lib/proposal/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProposalCaseRow } from "@/lib/supabase/types";

const APPROVER_NAMES: Record<"manager" | "director", string> = {
  manager: "部長 高橋",
  director: "支社長 伊藤",
};

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

export async function confirmChecklist(id: string): Promise<ProposalCase> {
  const supabase = createSupabaseServerClient();
  const existing = await getProposalCaseById(id);

  if (!existing) {
    throw new Error("案件が見つかりません");
  }

  if (existing.checklistConfirmed) {
    return existing;
  }

  const { data, error } = await supabase
    .from("proposal_cases")
    .update({
      checklist_confirmed: true,
      status: "ready_to_generate",
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`チェックリストの確定に失敗しました: ${error.message}`);
  }

  return rowToProposalCase(data as ProposalCaseRow);
}

export async function requestApproval(
  id: string,
  reason?: string
): Promise<ProposalCase> {
  const existing = await getProposalCaseById(id);

  if (!existing) {
    throw new Error("案件が見つかりません");
  }

  if (!["editing", "returned"].includes(existing.status)) {
    throw new Error("承認申請できる状態ではありません");
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("proposal_cases")
    .update({
      status: "pending_manager",
      approval_request_reason: reason?.trim() || null,
      return_reason: null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`承認申請に失敗しました: ${error.message}`);
  }

  return rowToProposalCase(data as ProposalCaseRow);
}

export async function approveCase(
  id: string,
  role: Extract<UserRole, "manager" | "director">,
  comment?: string
): Promise<ProposalCase> {
  const existing = await getProposalCaseById(id);

  if (!existing) {
    throw new Error("案件が見つかりません");
  }

  const supabase = createSupabaseServerClient();
  const now = new Date().toISOString();
  const trimmedComment = comment?.trim() || null;

  if (role === "manager") {
    if (existing.status !== "pending_manager") {
      throw new Error("部長承認できる状態ではありません");
    }

    const { data, error } = await supabase
      .from("proposal_cases")
      .update({
        status: "pending_director",
        manager_approved_at: now,
        manager_approver_name: APPROVER_NAMES.manager,
        manager_approval_comment: trimmedComment,
        return_reason: null,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new Error(`部長承認に失敗しました: ${error.message}`);
    }

    return rowToProposalCase(data as ProposalCaseRow);
  }

  if (existing.status !== "pending_director") {
    throw new Error("支社長承認できる状態ではありません");
  }

  const { data, error } = await supabase
    .from("proposal_cases")
    .update({
      status: "approved",
      director_approved_at: now,
      director_approver_name: APPROVER_NAMES.director,
      director_approval_comment: trimmedComment,
      return_reason: null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`支社長承認に失敗しました: ${error.message}`);
  }

  return rowToProposalCase(data as ProposalCaseRow);
}

export async function returnCase(
  id: string,
  role: Extract<UserRole, "manager" | "director">,
  reason: string
): Promise<ProposalCase> {
  const existing = await getProposalCaseById(id);

  if (!existing) {
    throw new Error("案件が見つかりません");
  }

  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    throw new Error("差し戻し理由を入力してください");
  }

  if (role === "manager" && existing.status !== "pending_manager") {
    throw new Error("部長差戻しできる状態ではありません");
  }

  if (role === "director" && existing.status !== "pending_director") {
    throw new Error("支社長差戻しできる状態ではありません");
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("proposal_cases")
    .update({
      status: "returned",
      return_reason: trimmedReason,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`差し戻しに失敗しました: ${error.message}`);
  }

  return rowToProposalCase(data as ProposalCaseRow);
}
