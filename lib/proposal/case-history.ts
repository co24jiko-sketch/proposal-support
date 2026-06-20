import type { AuthContext } from "@/lib/proposal/auth";
import type { AuditLogEntry, CaseVersion } from "@/lib/proposal/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ProposalAuditLogRow,
  ProposalCaseVersionRow,
} from "@/lib/supabase/types";

export type CaseHistory = {
  versions: CaseVersion[];
  auditLog: AuditLogEntry[];
};

/** 履歴表示用。サーバー環境に依存せず日本時間で統一する */
export function formatHistoryTimestamp(iso: string): string {
  const date = new Date(iso);
  const formatted = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return formatted.replace("T", " ");
}

function versionRowToCaseVersion(row: ProposalCaseVersionRow): CaseVersion {
  return {
    id: row.id,
    label: row.label,
    createdAt: formatHistoryTimestamp(row.created_at),
    action: row.action,
  };
}

function auditRowToAuditLogEntry(row: ProposalAuditLogRow): AuditLogEntry {
  return {
    id: row.id,
    at: formatHistoryTimestamp(row.created_at),
    user: row.user_name,
    action: row.action,
    detail: row.detail ?? undefined,
  };
}

export async function fetchCaseHistory(caseId: string): Promise<CaseHistory> {
  const supabase = await createSupabaseServerClient();

  const [versionsResult, auditResult] = await Promise.all([
    supabase
      .from("proposal_case_versions")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true }),
    supabase
      .from("proposal_audit_log")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false }),
  ]);

  if (versionsResult.error) {
    throw new Error(`版履歴の取得に失敗しました: ${versionsResult.error.message}`);
  }

  if (auditResult.error) {
    throw new Error(`操作ログの取得に失敗しました: ${auditResult.error.message}`);
  }

  return {
    versions: (versionsResult.data as ProposalCaseVersionRow[]).map(
      versionRowToCaseVersion
    ),
    auditLog: (auditResult.data as ProposalAuditLogRow[]).map(
      auditRowToAuditLogEntry
    ),
  };
}

export async function recordAuditLog(
  caseId: string,
  auth: AuthContext,
  action: string,
  detail?: string
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("proposal_audit_log").insert({
    case_id: caseId,
    action,
    detail: detail?.trim() || null,
    user_id: auth.userId,
    user_name: auth.profile.displayName,
  });

  if (error) {
    throw new Error(`操作ログの保存に失敗しました: ${error.message}`);
  }
}

export async function recordCaseVersion(
  caseId: string,
  auth: AuthContext,
  label: string,
  action: string,
  filePath?: string
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("proposal_case_versions").insert({
    case_id: caseId,
    label,
    action,
    file_path: filePath ?? null,
    created_by: auth.userId,
    created_by_name: auth.profile.displayName,
  });

  if (error) {
    throw new Error(`版履歴の保存に失敗しました: ${error.message}`);
  }
}
