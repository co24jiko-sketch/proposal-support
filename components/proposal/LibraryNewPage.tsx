"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LibraryNewPage() {
  return (
    <div className="mx-auto min-w-[1280px] max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">事例登録</h1>
      <Card>
        <CardHeader>
          <CardTitle>メタ情報（4項目必須）</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label>タイトル</Label>
            <Input placeholder="○○調査 技術提案（良例）" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>登録支社</Label>
              <Input placeholder="東京支社" />
            </div>
            <div className="space-y-2">
              <Label>様式</Label>
              <Select defaultValue="form-10">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="form-10">様式－１０</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>発注者・地域</Label>
              <Input placeholder="国交省関東地方整備局 / 関東" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>業務種別</Label>
              <Input defaultValue="地質調査業務" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>ファイル（Word / PDF）</Label>
            <Button variant="outline">アップロード</Button>
          </div>
        </CardContent>
        <CardFooter className="justify-between border-t">
          <Button variant="outline" render={<Link href="/proposal/library" />}>
            キャンセル
          </Button>
          <Button>登録して全社公開</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
