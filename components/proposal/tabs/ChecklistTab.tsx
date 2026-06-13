"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AlertTriangle, Plus, RefreshCw } from "lucide-react";

import { useProposal } from "@/components/proposal/proposal-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProposalCase } from "@/lib/proposal/types";
import { isDbCase } from "@/lib/proposal/utils";
import { cn } from "@/lib/utils";

export function ChecklistTab({ caseItem }: { caseItem: ProposalCase }) {
  const router = useRouter();
  const { llmStopped } = useProposal();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const confirmed = caseItem.checklistConfirmed;
  const canConfirm = !confirmed;
  const draftHref = `/proposal/cases/${caseItem.id}?tab=draft`;

  async function handleSeedChecklist() {
    setErrorMessage(null);
    setIsSeeding(true);

    try {
      if (isDbCase(caseItem.id)) {
        const response = await fetch(
          `/api/proposal/cases/${caseItem.id}/seed-checklist`,
          { method: "POST" }
        );

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? "採点項目の追加に失敗しました");
        }
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "採点項目の追加に失敗しました"
      );
    } finally {
      setIsSeeding(false);
    }
  }

  async function handleConfirm() {
    setErrorMessage(null);
    setIsConfirming(true);

    try {
      if (isDbCase(caseItem.id)) {
        const response = await fetch(
          `/api/proposal/cases/${caseItem.id}/confirm-checklist`,
          { method: "POST" }
        );

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? "チェックリストの確定に失敗しました");
        }
      }

      router.push(draftHref);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "チェックリストの確定に失敗しました"
      );
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>入札図書 PDF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex h-64 items-center justify-center rounded-lg border bg-muted/30 text-sm text-muted-foreground">
            PDF プレビュー（{caseItem.bidDocumentName ?? "未アップロード"}）
          </div>
          <Button variant="outline" size="sm" disabled={llmStopped || confirmed}>
            差し替え
          </Button>
          {llmStopped && !confirmed && (
            <p className="text-xs text-amber-700">
              LLM停止中のため、PDFからの新規抽出は利用できません
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>採点項目</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={confirmed}>
              <Plus />
              項目追加
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={llmStopped || confirmed}
            >
              <RefreshCw />
              PDFから再抽出
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>採点項目</TableHead>
                <TableHead>配点</TableHead>
                <TableHead>信頼度</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {caseItem.checklistItems.map((item) => (
                <TableRow
                  key={item.id}
                  className={cn(item.confidence === "low" && "bg-amber-50")}
                >
                  <TableCell className="whitespace-normal">{item.label}</TableCell>
                  <TableCell>{item.points}</TableCell>
                  <TableCell>
                    {item.confidence === "low" ? (
                      <Badge className="border-transparent bg-amber-100 text-amber-900">
                        <AlertTriangle className="size-3" />
                        要確認
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">高</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {caseItem.checklistItems.length === 0 && !confirmed && (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-muted-foreground">
                採点項目はまだありません。PDF抽出は未実装のため、サンプル項目を追加するか、そのまま確定して次に進めます。
              </p>
              {isDbCase(caseItem.id) && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleSeedChecklist}
                  disabled={isSeeding}
                >
                  {isSeeding ? "追加中..." : "サンプル採点項目を追加"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3 border-t sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {confirmed
                ? "確定済み — 文案・Wordタブで初稿を生成できます"
                : "確定後は編集に制限がかかります"}
            </p>
            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
          </div>
          {canConfirm ? (
            <Button onClick={handleConfirm} disabled={isConfirming}>
              {isConfirming ? "保存中..." : "確定して初稿生成へ"}
            </Button>
          ) : (
            <Button disabled>確定済み</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
