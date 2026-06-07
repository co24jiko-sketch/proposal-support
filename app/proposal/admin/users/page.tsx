import Link from "next/link";

import { roleLabels } from "@/lib/proposal/labels";
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
import type { UserRole } from "@/lib/proposal/types";

const users = [
  { name: "山田 太郎", role: "assignee" as UserRole, org: "東京支社" },
  { name: "部長 高橋", role: "manager" as UserRole, org: "東京支社" },
  { name: "支社長 伊藤", role: "director" as UserRole, org: "東京支社" },
  { name: "管理者 佐藤", role: "admin" as UserRole, org: "本社" },
];

export default function AdminUsersPage() {
  return (
    <div className="mx-auto min-w-[1280px] max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">ユーザー・役割</h1>
      <Card>
        <CardHeader>
          <CardTitle>Entra ID 連携（プロトタイプ）</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>氏名</TableHead>
                <TableHead>組織</TableHead>
                <TableHead>役割</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.name}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.org}</TableCell>
                  <TableCell>{roleLabels[user.role]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Button variant="ghost" render={<Link href="/proposal" />}>
        案件一覧へ
      </Button>
    </div>
  );
}
