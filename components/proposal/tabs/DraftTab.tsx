"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Download, RefreshCw, Sparkles } from "lucide-react";

import { ReferenceContextBar } from "@/components/proposal/ReferenceContextBar";
import { useProposal } from "@/components/proposal/proposal-context";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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



const sections = [

  { key: "summary", label: "１）提案の概要" },

  { key: "focusPoints", label: "① 着目点" },

  { key: "detail", label: "② 詳細な内容" },

  { key: "effects", label: "③ 効果" },

] as const;



function getDraftGenerateBlockReason(

  caseItem: ProposalCase,

  llmStopped: boolean

): string | null {

  if (llmStopped) {

    return "LLMサービス停止中のため、文案の生成は利用できません";

  }

  if (!caseItem.checklistConfirmed) {

    return "チェックリストを確定すると、初稿の生成が利用できます";

  }

  return null;

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

  const generateBlockReason = getDraftGenerateBlockReason(caseItem, llmStopped);
  const reimportBlockReason = getReimportBlockReason(caseItem);
  const hasGenerated = Object.values(caseItem.generatedSections).some(Boolean);
  const complianceHref = `/proposal/cases/${caseItem.id}?tab=compliance`;
  const canDownloadWord =
    hasGenerated && (!isDbCase(caseItem.id) || !!caseItem.wordFilePath);
  const wordDownloadHref = isDbCase(caseItem.id)
    ? `/api/proposal/cases/${caseItem.id}/download-word`
    : undefined;

  async function handleGenerateDraft() {
    if (generateBlockReason) return;

    setErrorMessage(null);
    setIsGenerating(true);

    try {
      if (isDbCase(caseItem.id)) {
        const response = await fetch(
          `/api/proposal/cases/${caseItem.id}/generate-draft`,
          { method: "POST" }
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

    <div className="space-y-4">

      <ReferenceContextBar caseItem={caseItem} showChecklistLink />



      <Card className={cn(phaseAActive && "ring-2 ring-primary/20")}>

        <CardHeader>

          <div className="flex items-center gap-2">

            <Badge variant={phaseAActive ? "default" : "secondary"}>

              Phase A

            </Badge>

            <CardTitle>初稿生成</CardTitle>

          </div>

        </CardHeader>

        <CardContent className="space-y-4">

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

                return (

                  <TableRow key={section.key}>

                    <TableCell>{section.label}</TableCell>

                    <TableCell>

                      <Badge variant={generated ? "secondary" : "outline"}>

                        {generated ? "生成済" : "未生成"}

                      </Badge>

                    </TableCell>

                    <TableCell className="space-x-2 text-right">

                      <Button size="sm" variant="ghost">

                        プレビュー

                      </Button>

                      <Button

                        size="sm"

                        variant="outline"

                        disabled={!caseItem.checklistConfirmed || llmStopped}

                      >

                        <RefreshCw />

                        再生成

                      </Button>

                    </TableCell>

                  </TableRow>

                );

              })}

            </TableBody>

          </Table>



          <div className="flex flex-wrap gap-2">

            <Button
              disabled={!!generateBlockReason || isGenerating}
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



      <Card className={cn(phaseBActive && "ring-2 ring-primary/20")}>

        <CardHeader>

          <div className="flex items-center gap-2">

            <Badge variant={phaseBActive ? "default" : "secondary"}>

              Phase B

            </Badge>

            <CardTitle>Word 再取込（手修正後）</CardTitle>

          </div>

        </CardHeader>

        <CardContent className="space-y-3">

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


