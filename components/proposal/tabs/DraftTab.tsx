"use client";



import Link from "next/link";

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

  const { llmStopped } = useProposal();

  const generateBlockReason = getDraftGenerateBlockReason(caseItem, llmStopped);

  const reimportBlockReason = getReimportBlockReason(caseItem);

  const hasGenerated = Object.values(caseItem.generatedSections).some(Boolean);

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

            <Button disabled={!!generateBlockReason}>

              <Sparkles />

              初稿を一括生成

            </Button>

            <Button variant="outline" disabled={!caseItem.checklistConfirmed}>

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

              disabled={!!reimportBlockReason}

              render={

                !reimportBlockReason ? (

                  <Link

                    href={`/proposal/cases/${caseItem.id}?tab=compliance`}

                  />

                ) : undefined

              }

            >

              再取込して適合チェックへ

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


