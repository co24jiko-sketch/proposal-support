import { NextResponse } from "next/server";

import type { UserRole } from "@/lib/proposal/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProposalProfile = {
  id: string;
  displayName: string;
  role: UserRole;
  org: string;
};

export type AuthContext = {
  userId: string;
  email: string | undefined;
  profile: ProposalProfile;
};

const VALID_ROLES: UserRole[] = ["assignee", "manager", "director", "admin"];

function parseRole(value: unknown): UserRole | null {
  if (typeof value !== "string") return null;
  return VALID_ROLES.includes(value as UserRole) ? (value as UserRole) : null;
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profileRow, error: profileError } = await supabase
    .from("proposal_profiles")
    .select("id, display_name, role, org")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profileRow) {
    return null;
  }

  const role = parseRole(profileRow.role);
  if (!role) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    profile: {
      id: profileRow.id,
      displayName: profileRow.display_name,
      role,
      org: profileRow.org ?? "",
    },
  };
}

export async function requireAuthContext(): Promise<
  AuthContext | NextResponse
> {
  const context = await getAuthContext();
  if (!context) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }
  return context;
}

export async function requireRoles(
  allowedRoles: UserRole[]
): Promise<AuthContext | NextResponse> {
  const context = await requireAuthContext();
  if (context instanceof NextResponse) {
    return context;
  }

  if (!allowedRoles.includes(context.profile.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  return context;
}

export function isAuthContext(
  value: AuthContext | NextResponse
): value is AuthContext {
  return !(value instanceof NextResponse);
}

export function canManageCase(
  context: AuthContext,
  assigneeId: string | null | undefined
): boolean {
  if (context.profile.role === "admin") return true;
  return !!assigneeId && assigneeId === context.userId;
}

export function canApproveCase(
  context: AuthContext,
  status: string
): boolean {
  if (context.profile.role === "manager" && status === "pending_manager") {
    return true;
  }
  if (context.profile.role === "director" && status === "pending_director") {
    return true;
  }
  return context.profile.role === "admin";
}

export function canReturnCase(
  context: AuthContext,
  status: string
): boolean {
  return canApproveCase(context, status);
}
