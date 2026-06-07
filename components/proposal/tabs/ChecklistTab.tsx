"use client";



import Link from "next/link";

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

import { cn } from "@/lib/utils";



export function ChecklistTab({ caseItem }: { caseItem: ProposalCase }) {

  const { llmStopped } = useProposal();

  const confirmed = caseItem.checklistConfirmed;

  const canConfirm = !confirmed && caseItem.checklistItems.length > 0;

  const draftHref = `/proposal/cases/${caseItem.id}?tab=draft`;



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

        </CardContent>

        <CardFooter className="flex-col items-stretch gap-3 border-t sm:flex-row sm:items-center sm:justify-between">

          <p className="text-sm text-muted-foreground">

            {confirmed

              ? "確定済み — 文案・Wordタブで初稿を生成できます"

              : "確定後は編集に制限がかかります"}

          </p>

          {canConfirm ? (

            <Button render={<Link href={draftHref} />}>

              確定して初稿生成へ

            </Button>

          ) : (

            <Button disabled>

              {confirmed ? "確定済み" : "採点項目がありません"}

            </Button>

          )}

        </CardFooter>

      </Card>

    </div>

  );

}


