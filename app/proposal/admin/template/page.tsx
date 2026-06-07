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
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>（様式－１０）+ 5コンテンツコントロール</p>
          <p>Phase 0 で作成予定</p>
          <Button variant="outline">テンプレをアップロード</Button>
        </CardContent>
      </Card>
      <Button variant="ghost" render={<Link href="/proposal" />}>
        案件一覧へ
      </Button>
    </div>
  );
}
