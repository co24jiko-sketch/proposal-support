"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useProposal } from "@/components/proposal/proposal-context";
import { ApprovalStepper } from "@/components/proposal/ApprovalStepper";
import {
  ComplianceSummaryBadges,
  ComplianceTable,
} from "@/components/proposal/ComplianceTable";
import { getComplianceSummary } from "@/lib/proposal/mock-data";
import type { ProposalCase, UserRole } from "@/lib/proposal/types";
import { isDbCase, isPendingApprovalForRole } from "@/lib/proposal/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

async function postApprovalAction(
  caseId: string,
  endpoint: "approve" | "return",
  payload: { reason?: string; comment?: string }
) {
  const response = await fetch(`/api/proposal/cases/${caseId}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "操作に失敗しました");
  }
}

export function ApprovalTab({ caseItem }: { caseItem: ProposalCase }) {
  const router = useRouter();
  const { role } = useProposal();
  const [returnReason, setReturnReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const summary = getComplianceSummary(caseItem);
  const canApprove = isPendingApprovalForRole(role, caseItem);
  const draftHref = `/proposal/cases/${caseItem.id}?tab=draft`;

  async function handleExportPdf() {
    setErrorMessage(null);
    setIsExportingPdf(true);

    try {
      if (isDbCase(caseItem.id)) {
        const response = await fetch(
          `/api/proposal/cases/${caseItem.id}/generate-pdf`,
          { method: "POST" }
        );

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? "PDF 出力に失敗しました");
        }

        window.location.href = `/api/proposal/cases/${caseItem.id}/download-pdf`;
        router.refresh();
        return;
      }

      window.alert("モック案件では PDF 出力のデモのみです");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "PDF 出力に失敗しました"
      );
    } finally {
      setIsExportingPdf(false);
    }
  }

  async function handleApprove() {
    if (role !== "manager" && role !== "director") return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (isDbCase(caseItem.id)) {
        await postApprovalAction(caseItem.id, "approve", {});
      }
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "承認に失敗しました"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReturn() {
    if (role !== "manager" && role !== "director") return;
    if (!returnReason.trim()) {
      setErrorMessage("差し戻し理由を入力してください");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (isDbCase(caseItem.id)) {
        await postApprovalAction(caseItem.id, "return", {
          reason: returnReason,
        });
      }
      router.push(draftHref);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "差し戻しに失敗しました"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>承認フロー</CardTitle>
        </CardHeader>
        <CardContent>
          <ApprovalStepper caseItem={caseItem} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>適合サマリ</CardTitle>
          <ComplianceSummaryBadges {...summary} />
        </CardHeader>
        <CardContent>
          {caseItem.approvalRequestReason && (
            <p className="mb-4 rounded-lg bg-muted p-3 text-sm">
              <span className="font-medium">申請時コメント: </span>
              {caseItem.approvalRequestReason}
            </p>
          )}
          <ComplianceTable items={caseItem.complianceItems} compact />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>提出 Word プレビュー（読取専用）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-auto rounded-lg border bg-muted/20 p-4 text-sm leading-relaxed text-muted-foreground">
              １）提案の概要
              <br />
              本調査では…（プレビュー）
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>承認操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {canApprove ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="return-reason">差し戻し理由（差戻時必須）</Label>
                  <Textarea
                    id="return-reason"
                    placeholder="修正が必要な点を記入"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                {errorMessage && (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleReturn}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "処理中..." : "差し戻して文案修正へ"}
                  </Button>
                  <Button onClick={handleApprove} disabled={isSubmitting}>
                    {isSubmitting ? "処理中..." : "承認する"}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {role === "assignee"
                  ? "承認待ちです。部長 → 支社長の順に進みます。"
                  : "この案件の承認操作は現在できません。"}
              </p>
            )}
            {caseItem.status === "returned" && caseItem.returnReason && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                <span className="font-medium">差戻理由: </span>
                {caseItem.returnReason}
              </p>
            )}
            {caseItem.status === "approved" && (
              <div className="space-y-2">
                <Button
                  onClick={() => void handleExportPdf()}
                  disabled={isExportingPdf}
                >
                  {isExportingPdf ? "PDF生成中..." : "提出版 PDF を出力"}
                </Button>
                {caseItem.pdfFilePath && isDbCase(caseItem.id) && (
                  <Button
                    variant="outline"
                    render={
                      <a
                        href={`/api/proposal/cases/${caseItem.id}/download-pdf`}
                        download
                      />
                    }
                  >
                    保存済み PDF を再ダウンロード
                  </Button>
                )}
              </div>
            )}
            {caseItem.status === "returned" && role === "assignee" && (
              <Button render={<Link href={draftHref} />}>
                差戻内容を修正する
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
