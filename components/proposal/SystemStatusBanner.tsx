"use client";

import { AlertTriangle } from "lucide-react";

import { useProposal } from "@/components/proposal/proposal-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function SystemStatusBanner() {
  const { llmStopped, setLlmStopped } = useProposal();

  if (!llmStopped) return null;

  return (
    <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
      <AlertTriangle />
      <AlertTitle>LLMサービス停止中</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
        <span>
          文案生成・PDFからの新規抽出は利用できません。チェックリスト編集・再取込・承認は継続できます。
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setLlmStopped(false)}
        >
          （デモ）復旧
        </Button>
      </AlertDescription>
    </Alert>
  );
}
