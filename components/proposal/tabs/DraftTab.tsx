"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Download, RefreshCw, Sparkles } from "lucide-react";

import { ReferenceContextBar } from "@/components/proposal/ReferenceContextBar";
import { DraftReadinessChecklist } from "@/components/proposal/DraftReadinessChecklist";
import { useProposal } from "@/components/proposal/proposal-context";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { AiDraftSectionKey } from "@/lib/proposal/ai-draft";
import type { ProposalCase } from "@/lib/proposal/types";
import { getDraftReadiness } from "@/lib/proposal/draft-readiness";
import { isDbCase } from "@/lib/proposal/utils";
import { cn } from "@/lib/utils";



const sections = [

  { key: "summary", label: "１）提案の概要" },

  { key: "focusPoints", label: "① 着目点" },

  { key: "detail", label: "② 詳細な内容" },

  { key: "effects", label: "③ 効果" },

] as const;

function getSectionPreviewText(
  caseItem: ProposalCase,
  key: (typeof sections)[number]["key"]
): string | null {
  const content = caseItem.draftSections?.[key as AiDraftSectionKey];
  return content?.trim() ? content : null;
}

function getSectionPreviewMessage(
  caseItem: ProposalCase,
  key: (typeof sections)[number]["key"]
): string {
  const previewText = getSectionPreviewText(caseItem, key);
  if (previewText) return previewText;

  const generated =
    caseItem.generatedSections[
      key as keyof typeof caseItem.generatedSections
    ];
  if (generated) {
    return [
      "この章の AI 文案がデータベースに保存されていません。",
      "Step 6 導入前に生成した初稿の可能性があります。",
      "「初稿を一括生成」をもう一度実行してください。",
      "（Supabase で add_draft_sections.sql の実行と ANTHROPIC_API_KEY または PROPOSAL_AI_STUB=true の設定も確認してください）",
    ].join("\n");
  }

  return "まだ生成されていません。「初稿を一括生成」を実行してください。";
}

function canPreviewSection(
  caseItem: ProposalCase,
  key: (typeof sections)[number]["key"]
): boolean {
  if (getSectionPreviewText(caseItem, key)) return true;
  return caseItem.generatedSections[
    key as keyof typeof caseItem.generatedSections
  ];
}

function getReimportBlockReason(caseItem: ProposalCase): string | null {

  const generated = Object.values(caseItem.generatedSections).some(Boolean);

  if (!generated) {

    return "初稿を生成して Word をダウンロードした後に、再取込が利用できます";

  }

  return null;

}



export function DraftTab({ caseItem }: { caseItem: ProposalCase }) {
  const router = useRouter();
  const { llmStopped } = useProposal();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReimporting, setIsReimporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewSection, setPreviewSection] = useState<
    (typeof sections)[number] | null
  >(null);

  const draftReadiness = getDraftReadiness(caseItem, llmStopped);
  const generateBlockReason = draftReadiness.blockReason;
  const reimportBlockReason = getReimportBlockReason(caseItem);
  const hasGenerated = Object.values(caseItem.generatedSections).some(Boolean);
  const complianceHref = `/proposal/cases/${caseItem.id}?tab=compliance`;
  const canDownloadWord =
    hasGenerated && (!isDbCase(caseItem.id) || !!caseItem.wordFilePath);
  const wordDownloadHref = isDbCase(caseItem.id)
    ? `/api/proposal/cases/${caseItem.id}/download-word`
    : undefined;

  async function handleGenerateDraft() {
    if (!draftReadiness.canGenerate) return;

    setErrorMessage(null);
    setIsGenerating(true);

    try {
      if (isDbCase(caseItem.id)) {
        const response = await fetch(
          `/api/proposal/cases/${caseItem.id}/generate-draft`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ llmStopped }),
          }
        );

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? "初稿生成の保存に失敗しました");
        }
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "初稿生成の保存に失敗しました"
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleReimport() {
    if (reimportBlockReason) return;

    setErrorMessage(null);
    setIsReimporting(true);

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

      router.push(complianceHref);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "適合チェック結果の保存に失敗しました"
      );
    } finally {
      setIsReimporting(false);
    }
  }

  const phaseAActive =

    caseItem.status === "ready_to_generate" ||

    (!hasGenerated && caseItem.checklistConfirmed);

  const phaseBActive =

    caseItem.status === "editing" ||

    caseItem.status === "returned" ||

    (hasGenerated && !phaseAActive);



  return (

    <div className="flex flex-col gap-4">

      <ReferenceContextBar caseItem={caseItem} showChecklistLink />

      <DraftReadinessChecklist readiness={draftReadiness} />

      {caseItem.draftSections?.needsTechnicalReview && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          要技術者確認: 材料不足または表現の確認が必要な下書きです。提出前に担当技術者が内容を確認してください。
        </p>
      )}

      <Card className={cn(phaseAActive && "ring-2 ring-primary/20")}>

        <CardHeader>

          <div className="flex items-center gap-2">

            <Badge variant={phaseAActive ? "default" : "secondary"}>

              Phase A

            </Badge>

            <CardTitle>初稿生成</CardTitle>

          </div>

        </CardHeader>

        <CardContent className="flex flex-col gap-4">

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>章</TableHead>

                <TableHead>状態</TableHead>

                <TableHead className="text-right">操作</TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>

              {sections.map((section) => {
                const generated =
                  caseItem.generatedSections[
                    section.key as keyof typeof caseItem.generatedSections
                  ];
                const canPreview = canPreviewSection(caseItem, section.key);

                return (
                  <TableRow key={section.key}>
                    <TableCell>{section.label}</TableCell>
                    <TableCell>
                      <Badge variant={generated ? "secondary" : "outline"}>
                        {generated ? "生成済" : "未生成"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={!canPreview}
                          onClick={() => setPreviewSection(section)}
                        >
                          プレビュー
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            !draftReadiness.canGenerate ||
                            isGenerating ||
                            llmStopped
                          }
                          onClick={() => void handleGenerateDraft()}
                        >
                          <RefreshCw />
                          再生成
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

            </TableBody>

          </Table>



          <div className="flex flex-wrap gap-2">

            <Button
              disabled={!draftReadiness.canGenerate || isGenerating}
              onClick={() => void handleGenerateDraft()}
            >
              <Sparkles />
              {isGenerating ? "生成中..." : "初稿を一括生成"}
            </Button>

            <Button
              variant="outline"
              disabled={!canDownloadWord}
              render={
                wordDownloadHref ? (
                  <a href={wordDownloadHref} download />
                ) : undefined
              }
            >
              <Download />
              Wordをダウンロード
            </Button>

          </div>

          {generateBlockReason ? (

            <p className="text-xs text-amber-700">{generateBlockReason}</p>

          ) : !caseItem.checklistConfirmed ? (

            <p className="text-xs text-muted-foreground">

              <Link

                href={`/proposal/cases/${caseItem.id}?tab=checklist`}

                className="text-primary underline-offset-4 hover:underline"

              >

                チェックリストを確定

              </Link>

              すると、初稿生成と Word ダウンロードが利用できます

            </p>

          ) : null}

          {errorMessage && (
            <p className="text-xs text-red-600">{errorMessage}</p>
          )}

        </CardContent>

      </Card>

      <Dialog
        open={previewSection !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewSection(null);
        }}
      >
        <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col gap-3">
          <DialogHeader>
            <DialogTitle>{previewSection?.label ?? "プレビュー"}</DialogTitle>
            <DialogDescription>
              AI が生成した下書きです。提出前に担当技術者が内容を確認してください。
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto whitespace-pre-wrap text-sm">
            {previewSection
              ? getSectionPreviewMessage(caseItem, previewSection.key)
              : null}
          </div>
        </DialogContent>
      </Dialog>

      <Card className={cn(phaseBActive && "ring-2 ring-primary/20")}>

        <CardHeader>

          <div className="flex items-center gap-2">

            <Badge variant={phaseBActive ? "default" : "secondary"}>

              Phase B

            </Badge>

            <CardTitle>Word 再取込（手修正後）</CardTitle>

          </div>

        </CardHeader>

        <CardContent className="flex flex-col gap-3">

          <p className="text-sm text-muted-foreground">

            図表（位置図・柱状図等）は Word 上で手挿入してください。再取込後は適合チェックタブへ自動的に進めます。

          </p>

          <div className="flex flex-wrap items-center gap-3">

            <Button variant="outline" disabled={!!reimportBlockReason}>

              ファイルを選択…

            </Button>

            <span className="text-sm text-muted-foreground">

              最終取込: {caseItem.currentWordVersion ?? "未"}

            </span>

            <Button
              disabled={!!reimportBlockReason || isReimporting}
              onClick={() => void handleReimport()}
            >
              {isReimporting ? "チェック中..." : "再取込して適合チェックへ"}
            </Button>

          </div>

          {reimportBlockReason && (

            <p className="text-xs text-amber-700">{reimportBlockReason}</p>

          )}

        </CardContent>

      </Card>

    </div>

  );

}


