"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { AlertTriangle, Plus, RefreshCw } from "lucide-react";

import { useProposal } from "@/components/proposal/proposal-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProposalCase } from "@/lib/proposal/types";
import { SCORING_TEMPLATES } from "@/lib/proposal/scoring-templates";
import { MAX_BID_PDF_BYTES, isPdfUpload } from "@/lib/proposal/bid-document-limits";
import { isDbCase } from "@/lib/proposal/utils";
import { cn } from "@/lib/utils";

export function ChecklistTab({ caseItem }: { caseItem: ProposalCase }) {
  const router = useRouter();
  const { llmStopped } = useProposal();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isUploadingBid, setIsUploadingBid] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    SCORING_TEMPLATES[0]?.id ?? ""
  );
  const bidFileInputRef = useRef<HTMLInputElement>(null);

  const confirmed = caseItem.checklistConfirmed;
  const canConfirm = !confirmed;
  const draftHref = `/proposal/cases/${caseItem.id}?tab=draft`;
  const hasBidDocument = Boolean(caseItem.bidFilePath);
  const bidInputId = `bid-upload-${caseItem.id}`;
  const uploadDisabled = confirmed || isUploadingBid || !isDbCase(caseItem.id);
  const extractDisabled =
    confirmed || isExtracting || !isDbCase(caseItem.id) || !hasBidDocument;
  const selectedTemplate = SCORING_TEMPLATES.find(
    (template) => template.id === selectedTemplateId
  );

  function getUploadDisabledReason(): string | null {
    if (!isDbCase(caseItem.id)) {
      return "デモ案件のためアップロードできません。一覧から DB 案件を開いてください。";
    }
    if (confirmed) {
      return "チェックリスト確定済みのため変更できません。新規案件を作成してください。";
    }
    if (isUploadingBid) {
      return "アップロード処理中です。";
    }
    return null;
  }

  async function handleBidUpload(file: File) {
    if (!isDbCase(caseItem.id)) return;

    const isPdf = isPdfUpload(file);
    if (!isPdf) {
      setErrorMessage(
        "入札図書は PDF ファイル（.pdf）のみアップロードできます"
      );
      return;
    }

    if (file.size > MAX_BID_PDF_BYTES) {
      setErrorMessage("入札図書 PDF は 4MB 以下にしてください");
      return;
    }

    setErrorMessage(null);
    setIsUploadingBid(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `/api/proposal/cases/${caseItem.id}/upload-bid`,
        { method: "POST", body: formData }
      );

      if (!response.ok) {
        if (response.status === 413) {
          throw new Error("入札図書 PDF は 4MB 以下にしてください");
        }
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "入札図書のアップロードに失敗しました");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "入札図書のアップロードに失敗しました"
      );
    } finally {
      setIsUploadingBid(false);
      if (bidFileInputRef.current) {
        bidFileInputRef.current.value = "";
      }
    }
  }

  async function handleApplyTemplate() {
    if (!selectedTemplateId) return;

    setErrorMessage(null);
    setIsApplyingTemplate(true);

    try {
      if (isDbCase(caseItem.id)) {
        const response = await fetch(
          `/api/proposal/cases/${caseItem.id}/apply-scoring-template`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ templateId: selectedTemplateId }),
          }
        );

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? "採点基準の適用に失敗しました");
        }
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "採点基準の適用に失敗しました"
      );
    } finally {
      setIsApplyingTemplate(false);
    }
  }

  async function handleExtractChecklist() {
    setErrorMessage(null);
    setIsExtracting(true);

    try {
      if (isDbCase(caseItem.id)) {
        const response = await fetch(
          `/api/proposal/cases/${caseItem.id}/extract-checklist`,
          { method: "POST" }
        );

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? "採点項目の抽出に失敗しました");
        }
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "採点項目の抽出に失敗しました"
      );
    } finally {
      setIsExtracting(false);
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
        <CardContent className="flex flex-col gap-3">
          <div className="flex h-64 items-center justify-center rounded-lg border bg-muted/30 text-sm text-muted-foreground">
            {hasBidDocument
              ? `アップロード済み: ${caseItem.bidDocumentName ?? "入札図書.pdf"}`
              : `PDF プレビュー（${caseItem.bidDocumentName ?? "未アップロード"}）`}
          </div>
          <div className="relative w-fit">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploadDisabled}
              className={uploadDisabled ? undefined : "pointer-events-none"}
              tabIndex={uploadDisabled ? undefined : -1}
            >
              {isUploadingBid
                ? "アップロード中..."
                : hasBidDocument
                  ? "差し替え"
                  : "PDFをアップロード"}
            </Button>
            {!uploadDisabled && (
              <input
                ref={bidFileInputRef}
                id={bidInputId}
                type="file"
                accept=".pdf,application/pdf"
                aria-label="入札図書 PDF を選択"
                className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleBidUpload(file);
                }}
              />
            )}
          </div>
          {getUploadDisabledReason() && (
            <p className="text-xs text-amber-700">{getUploadDisabledReason()}</p>
          )}
          {!uploadDisabled && (
            <p className="text-xs text-muted-foreground">
              PDF・4MB 以下。ログイン中のユーザーが作成した案件のみアップロードできます。
            </p>
          )}
          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}
          {llmStopped && !confirmed && (
            <p className="text-xs text-amber-700">
              LLM停止中でも PDF からの採点項目抽出は利用できます
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>採点項目</CardTitle>
          <Button size="sm" variant="outline" disabled={confirmed}>
            <Plus />
            項目追加
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!confirmed && isDbCase(caseItem.id) && (
            <div className="flex flex-col gap-3 border-b pb-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">採点基準マスタ</p>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate?.description ??
                    "案件に適用する採点基準を選択してください。"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={selectedTemplateId}
                  onValueChange={(value) => setSelectedTemplateId(value ?? "")}
                >
                  <SelectTrigger className="w-full min-w-[240px]">
                    <SelectValue placeholder="採点基準を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCORING_TEMPLATES.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => void handleApplyTemplate()}
                  disabled={!selectedTemplateId || isApplyingTemplate}
                >
                  {isApplyingTemplate ? "適用中..." : "適用する"}
                </Button>
              </div>
              {hasBidDocument && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={extractDisabled}
                  onClick={() => void handleExtractChecklist()}
                >
                  <RefreshCw />
                  {isExtracting ? "抽出中..." : "PDFから再抽出（補助・任意）"}
                </Button>
              )}
            </div>
          )}
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
            <div className="mt-3 flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                採点項目はまだありません。上の採点基準マスタから「適用する」を押すか、0件のまま確定して次に進めます（適合チェックはスキップ扱いになります）。
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3 border-t sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
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
