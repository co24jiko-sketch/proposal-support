import {
  type AuthContext,
  canApproveCase,
  canManageCase,
  canReturnCase,
} from "@/lib/proposal/auth";
import {
  buildSubmissionPdfBuffer,
  buildWordDocxBuffer,
} from "@/lib/proposal/document-content";
import {
  pdfObjectPath,
  uploadProposalFile,
  wordObjectPath,
} from "@/lib/proposal/file-storage";
import { generateMockComplianceItems } from "@/lib/proposal/compliance-mock";
import { rowToProposalCase } from "@/lib/proposal/map-case-row";
import { SAMPLE_CHECKLIST_ITEMS } from "@/lib/proposal/sample-checklist";
import type { ChecklistItem, ProposalCase } from "@/lib/proposal/types";
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

function assertCanManageCase(auth: AuthContext, caseItem: ProposalCase): void {
  if (!canManageCase(auth, caseItem.assigneeId || null)) {
    throw new Error("この案件を操作する権限がありません");
  }
}

export async function listProposalCases(): Promise<ProposalCase[]> {
  const supabase = await createSupabaseServerClient();
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
  const supabase = await createSupabaseServerClient();
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
  auth: AuthContext,
  input: CreateProposalCaseInput
): Promise<ProposalCase> {
  const supabase = await createSupabaseServerClient();
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
      assignee_id: auth.userId,
      assignee_name: auth.profile.displayName,
      status: "checklist_pending",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`案件の作成に失敗しました: ${error.message}`);
  }

  return rowToProposalCase(data as ProposalCaseRow);
}

export async function confirmChecklist(
  auth: AuthContext,
  id: string
): Promise<ProposalCase> {
  const existing = await getProposalCaseById(id);

  if (!existing) {
    throw new Error("案件が見つかりません");
  }

  assertCanManageCase(auth, existing);

  if (existing.checklistConfirmed) {
    return existing;
  }

  const supabase = await createSupabaseServerClient();
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

export async function seedChecklistItems(
  auth: AuthContext,
  id: string
): Promise<ProposalCase> {
  const existing = await getProposalCaseById(id);

  if (!existing) {
    throw new Error("案件が見つかりません");
  }

  assertCanManageCase(auth, existing);

  if (existing.checklistConfirmed) {
    throw new Error("確定済みのチェックリストは編集できません");
  }

  if (existing.checklistItems.length > 0) {
    return existing;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("proposal_cases")
    .update({ checklist_items: SAMPLE_CHECKLIST_ITEMS })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`採点項目の保存に失敗しました: ${error.message}`);
  }

  return rowToProposalCase(data as ProposalCaseRow);
}

export async function saveChecklistItems(
  auth: AuthContext,
  id: string,
  items: ChecklistItem[]
): Promise<ProposalCase> {
  const existing = await getProposalCaseById(id);

  if (!existing) {
    throw new Error("案件が見つかりません");
  }

  assertCanManageCase(auth, existing);

  if (existing.checklistConfirmed) {
    throw new Error("確定済みのチェックリストは編集できません");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("proposal_cases")
    .update({ checklist_items: items })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`採点項目の保存に失敗しました: ${error.message}`);
  }

  return rowToProposalCase(data as ProposalCaseRow);
}

export async function generateDraft(
  auth: AuthContext,
  id: string
): Promise<ProposalCase> {
  const existing = await getProposalCaseById(id);

  if (!existing) {
    throw new Error("案件が見つかりません");
  }

  assertCanManageCase(auth, existing);

  if (!existing.checklistConfirmed) {
    throw new Error("チェックリストを確定してから初稿を生成してください");
  }

  const version = "v1";
  const wordPath = wordObjectPath(id, version);

  try {
    await uploadProposalFile(
      wordPath,
      await buildWordDocxBuffer(existing),
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Word ファイルの保存に失敗しました";
    throw new Error(`${message}（Supabase Storage の SQL を実行済みか確認してください）`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("proposal_cases")
    .update({
      generated_sections: {
        summary: true,
        focusPoints: true,
        detail: true,
        effects: true,
      },
      status: "editing",
      current_word_version: version,
      word_file_path: wordPath,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`初稿生成の保存に失敗しました: ${error.message}`);
  }

  return rowToProposalCase(data as ProposalCaseRow);
}

export async function runComplianceCheck(
  auth: AuthContext,
  id: string
): Promise<ProposalCase> {
  const existing = await getProposalCaseById(id);

  if (!existing) {
    throw new Error("案件が見つかりません");
  }

  assertCanManageCase(auth, existing);

  const hasGenerated = Object.values(existing.generatedSections).some(Boolean);
  if (!hasGenerated) {
    throw new Error("初稿を生成してから適合チェックを実行してください");
  }

  const complianceItems = generateMockComplianceItems(existing.checklistItems);
  const nextVersion = existing.currentWordVersion
    ? `v${Number.parseInt(existing.currentWordVersion.replace(/\D/g, ""), 10) + 1 || 2}`
    : "v2";
  const wordPath = wordObjectPath(id, nextVersion);

  try {
    await uploadProposalFile(
      wordPath,
      await buildWordDocxBuffer({ ...existing, currentWordVersion: nextVersion }),
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Word ファイルの保存に失敗しました";
    throw new Error(`${message}（Supabase Storage の SQL を実行済みか確認してください）`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("proposal_cases")
    .update({
      compliance_items: complianceItems,
      current_word_version: nextVersion,
      word_file_path: wordPath,
      status: "editing",
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`適合チェック結果の保存に失敗しました: ${error.message}`);
  }

  return rowToProposalCase(data as ProposalCaseRow);
}

export async function generateSubmissionPdf(
  auth: AuthContext,
  id: string
): Promise<ProposalCase> {
  const existing = await getProposalCaseById(id);

  if (!existing) {
    throw new Error("案件が見つかりません");
  }

  if (existing.status !== "approved") {
    throw new Error("承認済みの案件のみ PDF を出力できます");
  }

  if (
    auth.profile.role !== "admin" &&
    existing.assigneeId !== auth.userId
  ) {
    throw new Error("PDF を出力する権限がありません");
  }

  const pdfPath = pdfObjectPath(id);

  try {
    await uploadProposalFile(
      pdfPath,
      await buildSubmissionPdfBuffer(existing),
      "application/pdf"
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PDF ファイルの保存に失敗しました";
    throw new Error(`${message}（Supabase Storage の SQL を実行済みか確認してください）`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("proposal_cases")
    .update({ pdf_file_path: pdfPath })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`PDF 出力の保存に失敗しました: ${error.message}`);
  }

  return rowToProposalCase(data as ProposalCaseRow);
}

export async function requestApproval(
  auth: AuthContext,
  id: string,
  reason?: string
): Promise<ProposalCase> {
  const existing = await getProposalCaseById(id);

  if (!existing) {
    throw new Error("案件が見つかりません");
  }

  assertCanManageCase(auth, existing);

  if (!["editing", "returned"].includes(existing.status)) {
    throw new Error("承認申請できる状態ではありません");
  }

  const supabase = await createSupabaseServerClient();
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
  auth: AuthContext,
  id: string,
  comment?: string
): Promise<ProposalCase> {
  const existing = await getProposalCaseById(id);

  if (!existing) {
    throw new Error("案件が見つかりません");
  }

  if (!canApproveCase(auth, existing.status)) {
    throw new Error("承認できる状態ではありません");
  }

  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();
  const trimmedComment = comment?.trim() || null;
  const approverName = auth.profile.displayName;

  if (existing.status === "pending_manager") {
    const { data, error } = await supabase
      .from("proposal_cases")
      .update({
        status: "pending_director",
        manager_approved_at: now,
        manager_approver_name: approverName,
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
      director_approver_name: approverName,
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
  auth: AuthContext,
  id: string,
  reason: string
): Promise<ProposalCase> {
  const existing = await getProposalCaseById(id);

  if (!existing) {
    throw new Error("案件が見つかりません");
  }

  if (!canReturnCase(auth, existing.status)) {
    throw new Error("差戻しできる状態ではありません");
  }

  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    throw new Error("差し戻し理由を入力してください");
  }

  const supabase = await createSupabaseServerClient();
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
