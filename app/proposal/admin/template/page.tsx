import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminTemplatePage() {
  return (
    <div className="mx-auto min-w-[1280px] max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">様式テンプレ管理</h1>
      <Card>
        <CardHeader>
          <CardTitle>技術提案書様式_ツール用_v1.docx</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>（様式－１０）docxtemplater プレースホルダー付きテンプレート</p>
          <p>
            実ファイル:{" "}
            <code className="text-foreground">
              lib/proposal/templates/form-10-official-source.docx
            </code>
          </p>
          <p>高山資料の様式－１０をそのまま流し込み先に使用します。</p>
          <Button variant="outline" disabled>
            テンプレをアップロード（将来）
          </Button>
        </CardContent>
      </Card>
      <Button variant="ghost" render={<Link href="/proposal" />}>
        案件一覧へ
      </Button>
    </div>
  );
}
