"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ReferenceContextBar } from "@/components/proposal/ReferenceContextBar";
import {
  ComplianceSummaryBadges,
  ComplianceTable,
} from "@/components/proposal/ComplianceTable";
import { getComplianceSummary } from "@/lib/proposal/mock-data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProposalCase } from "@/lib/proposal/types";
import { isDbCase } from "@/lib/proposal/utils";

export function ComplianceTab({ caseItem }: { caseItem: ProposalCase }) {
  const router = useRouter();
  const summary = getComplianceSummary(caseItem);
  const [reason, setReason] = useState(caseItem.approvalRequestReason ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRechecking, setIsRechecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasIssues = summary.partial > 0 || summary.missing > 0;
  const hasCompliance = caseItem.complianceItems.length > 0;
  const approvalHref = `/proposal/cases/${caseItem.id}?tab=approval`;
  const draftHref = `/proposal/cases/${caseItem.id}?tab=draft`;
  const canSubmit = !hasIssues || reason.trim().length > 0;

  async function handleRecheck() {
    setErrorMessage(null);
    setIsRechecking(true);

    try {
      if (isDbCase(caseItem.id)) {
        const response = await fetch(
          `/api/proposal/cases/${caseItem.id}/run-compliance`,
          { method: "POST" }
        );

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(
            body?.error ?? "適合チェック結果の保存に失敗しました"
          );
        }
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "適合チェック結果の保存に失敗しました"
      );
    } finally {
      setIsRechecking(false);
    }
  }

  async function handleRequestApproval() {
    if (!canSubmit) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (isDbCase(caseItem.id)) {
        const response = await fetch(
          `/api/proposal/cases/${caseItem.id}/request-approval`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason: reason.trim() || undefined }),
          }
        );

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? "承認申請に失敗しました");
        }
      }

      router.push(approvalHref);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "承認申請に失敗しました"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <ReferenceContextBar caseItem={caseItem} />

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>適合チェック</CardTitle>
            <p className="text-sm text-muted-foreground">
              再取込版: {caseItem.currentWordVersion ?? "—"}
            </p>
          </div>
          {hasCompliance && <ComplianceSummaryBadges {...summary} />}
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasCompliance ? (
            <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              <p className="mb-3">
                適合チェックは Word 再取込後に実行されます。
              </p>
              <Button render={<Link href={draftHref} />}>
                文案・Wordタブで再取込する
              </Button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isRechecking}
                  onClick={() => void handleRecheck()}
                >
                  {isRechecking ? "実行中..." : "再チェック実行"}
                </Button>
              </div>
              <ComplianceTable items={caseItem.complianceItems} />
            </>
          )}
        </CardContent>
        {hasCompliance && (
          <CardFooter className="flex-col items-stretch gap-2 border-t sm:flex-row sm:justify-end">
            {hasIssues && !reason.trim() && (
              <p className="mr-auto text-xs text-amber-700 sm:max-w-md">
                △または×が残っている場合は、申請理由の入力が必要です
              </p>
            )}
            {errorMessage && (
              <p className="mr-auto text-sm text-red-600">{errorMessage}</p>
            )}
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant={hasIssues ? "destructive" : "default"}>
                    承認を申請する
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {hasIssues
                      ? `△${summary.partial} ×${summary.missing} が残っています`
                      : "承認を申請しますか？"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {hasIssues
                      ? "理由を入力して申請してください。承認タブで進捗を確認できます。"
                      : "申請後、部長 → 支社長の順に承認が進みます。"}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {hasIssues && (
                  <div className="space-y-2">
                    <Label htmlFor="approval-reason">申請理由（必須）</Label>
                    <Textarea
                      id="approval-reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="例: ×1は図面参照でカバー予定"
                    />
                  </div>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isSubmitting}>
                    キャンセル
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={!canSubmit || isSubmitting}
                    onClick={(e) => {
                      e.preventDefault();
                      void handleRequestApproval();
                    }}
                  >
                    {isSubmitting ? "申請中..." : "申請して承認タブへ"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
