"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, FileText } from "lucide-react";

import { useProposal } from "@/components/proposal/proposal-context";
import { APP_NAME, roleLabels } from "@/lib/proposal/labels";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/proposal/types";

const navItems = [
  { href: "/proposal", label: "案件一覧" },
  { href: "/proposal/library", label: "事例ライブラリ" },
];

export function AppHeader() {
  const pathname = usePathname();
  const { role, setRole, llmStopped, setLlmStopped } = useProposal();

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 min-w-[1280px] items-center gap-6 px-6">
        <Link href="/proposal" className="flex items-center gap-2 font-semibold">
          <FileText className="size-5" />
          {APP_NAME}
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              render={<Link href={item.href} />}
              className={cn(
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "bg-muted"
                  : undefined
              )}
            >
              {item.label}
            </Button>
          ))}

          {role === "admin" && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="sm">
                    管理
                    <ChevronDown />
                  </Button>
                }
              />
              <DropdownMenuContent align="start">
                <DropdownMenuItem render={<Link href="/proposal/admin/template" />}>
                  様式テンプレ
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/proposal/admin/users" />}>
                  ユーザー・役割
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Button
            size="sm"
            variant={llmStopped ? "destructive" : "outline"}
            onClick={() => setLlmStopped(!llmStopped)}
          >
            LLM {llmStopped ? "停止中" : "正常"}
          </Button>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">ロール（デモ）:</span>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as UserRole)}
            >
              <SelectTrigger className="w-[180px]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(roleLabels) as UserRole[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {roleLabels[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  );
}
