"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { useProposal } from "@/components/proposal/proposal-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProposalCase } from "@/lib/proposal/types";
import { MAX_BID_PDF_BYTES, isPdfUpload } from "@/lib/proposal/bid-document-limits";
import { isDbCase } from "@/lib/proposal/utils";

export function ChecklistTab({ caseItem }: { caseItem: ProposalCase }) {
  const router = useRouter();
  const { llmStopped } = useProposal();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmingAxis, setIsConfirmingAxis] = useState(false);
  const [isUploadingBid, setIsUploadingBid] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [axisErrorMessage, setAxisErrorMessage] = useState<string | null>(null);
  const [axisInput, setAxisInput] = useState(
    () => caseItem.proposalAxisConfirmed ?? caseItem.proposalAxisDraft
  );
  const bidFileInputRef = useRef<HTMLInputElement>(null);

  const confirmed = caseItem.checklistConfirmed;
  const canConfirm = !confirmed;
  const isAxisConfirmed = Boolean(caseItem.proposalAxisConfirmed?.trim());
  const needsAxisConfirm =
    Boolean(caseItem.evaluationTheme) && !isAxisConfirmed;
  const draftHref = `/proposal/cases/${caseItem.id}?tab=draft`;
  const hasBidDocument = Boolean(caseItem.bidFilePath);
  const bidInputId = `bid-upload-${caseItem.id}`;
  const uploadDisabled = confirmed || isUploadingBid || !isDbCase(caseItem.id);

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

  async function handleConfirmAxis() {
    setAxisErrorMessage(null);
    setIsConfirmingAxis(true);

    try {
      if (!isDbCase(caseItem.id)) {
        throw new Error("デモ案件では提案の軸を確定できません");
      }

      const response = await fetch(
        `/api/proposal/cases/${caseItem.id}/confirm-proposal-axis`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirmedAxis: axisInput }),
        }
      );

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "提案の軸の確定に失敗しました");
      }

      router.refresh();
    } catch (error) {
      setAxisErrorMessage(
        error instanceof Error ? error.message : "提案の軸の確定に失敗しました"
      );
    } finally {
      setIsConfirmingAxis(false);
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
    <div className="flex flex-col gap-4">
      {caseItem.evaluationTheme && (
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2">
            <CardTitle>提案の軸</CardTitle>
            {isAxisConfirmed ? (
              <Badge variant="outline">確定済み</Badge>
            ) : (
              <Badge variant="outline">仮</Badge>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              評価テーマ: {caseItem.evaluationTheme}
              {caseItem.proposalAxisDraft && !isAxisConfirmed
                ? ` — 新規案件で入力した仮の軸: 「${caseItem.proposalAxisDraft}」`
                : ""}
            </p>
            {isAxisConfirmed ? (
              <p className="whitespace-pre-wrap text-sm">
                {caseItem.proposalAxisConfirmed}
              </p>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`proposal-axis-${caseItem.id}`}>
                    確定する提案の軸
                  </Label>
                  <Textarea
                    id={`proposal-axis-${caseItem.id}`}
                    rows={2}
                    value={axisInput}
                    disabled={confirmed || !isDbCase(caseItem.id)}
                    onChange={(event) => setAxisInput(event.target.value)}
                    placeholder="入札図書を確認したうえで、提案の軸を入力または修正してください"
                  />
                </div>
                {!hasBidDocument && (
                  <p className="text-xs text-amber-700">
                    入札図書 PDF をアップロードしてから確定できます。
                  </p>
                )}
                {axisErrorMessage && (
                  <p className="text-sm text-red-600">{axisErrorMessage}</p>
                )}
              </>
            )}
          </CardContent>
          {!isAxisConfirmed && !confirmed && (
            <CardFooter className="justify-end border-t">
              <Button
                onClick={() => void handleConfirmAxis()}
                disabled={
                  isConfirmingAxis ||
                  !isDbCase(caseItem.id) ||
                  !hasBidDocument ||
                  !axisInput.trim()
                }
              >
                {isConfirmingAxis ? "確定中..." : "提案の軸を確定"}
              </Button>
            </CardFooter>
          )}
        </Card>
      )}

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
          {llmStopped && !confirmed && (
            <p className="text-xs text-amber-700">
              LLM停止中でも入札図書のアップロードは利用できます
            </p>
          )}
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3 border-t sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">
              {confirmed
                ? "確定済み — 文案・Wordタブで初稿を生成できます"
                : needsAxisConfirm
                  ? "提案の軸を確定してから、チェックリストを確定してください"
                  : "確定後は編集に制限がかかります"}
            </p>
            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
          </div>
          {canConfirm ? (
            <Button
              onClick={() => void handleConfirm()}
              disabled={isConfirming || needsAxisConfirm}
            >
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
