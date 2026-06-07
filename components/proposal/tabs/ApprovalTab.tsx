"use client";

import Link from "next/link";

import { useProposal } from "@/components/proposal/proposal-context";
import { ApprovalStepper } from "@/components/proposal/ApprovalStepper";
import {
  ComplianceSummaryBadges,
  ComplianceTable,
} from "@/components/proposal/ComplianceTable";
import { getComplianceSummary } from "@/lib/proposal/mock-data";
import { isPendingApprovalForRole } from "@/lib/proposal/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProposalCase } from "@/lib/proposal/types";

export function ApprovalTab({ caseItem }: { caseItem: ProposalCase }) {
  const { role } = useProposal();
  const summary = getComplianceSummary(caseItem);
  const canApprove = isPendingApprovalForRole(role, caseItem);
  const draftHref = `/proposal/cases/${caseItem.id}?tab=draft`;

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
                  <Textarea id="return-reason" placeholder="修正が必要な点を記入" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="destructive"
                    render={<Link href={draftHref} />}
                  >
                    差し戻して文案修正へ
                  </Button>
                  <Button>承認する</Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {role === "assignee"
                  ? "承認待ちです。部長 → 支社長の順に進みます。"
                  : "この案件の承認操作は現在できません。"}
              </p>
            )}
            {caseItem.status === "approved" && (
              <Button>提出版 PDF を出力</Button>
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
