"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { mockLibraryItems } from "@/lib/proposal/mock-data";
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

export function LibraryListPage() {
  return (
    <div className="mx-auto min-w-[1280px] max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">事例ライブラリ</h1>
          <p className="text-sm text-muted-foreground">
            登録・選択した提案書のみ参照（自動横断検索なし）
          </p>
        </div>
        <Button render={<Link href="/proposal/library/new" />}>
          <Plus />
          事例登録
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>登録事例</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タイトル</TableHead>
                <TableHead>支社</TableHead>
                <TableHead>様式</TableHead>
                <TableHead>地域</TableHead>
                <TableHead>登録者</TableHead>
                <TableHead>日付</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLibraryItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.branch}</TableCell>
                  <TableCell>{item.formType}</TableCell>
                  <TableCell>{item.region}</TableCell>
                  <TableCell>{item.uploadedBy}</TableCell>
                  <TableCell>{item.uploadedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
