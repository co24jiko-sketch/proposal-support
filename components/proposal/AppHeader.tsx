"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, FileText, LogOut } from "lucide-react";

import { useProposal } from "@/components/proposal/proposal-context";
import { APP_NAME, roleLabels } from "@/lib/proposal/labels";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/proposal", label: "案件一覧" },
  { href: "/proposal/library", label: "事例ライブラリ" },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, displayName, email, llmStopped, setLlmStopped } = useProposal();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/proposal/login");
    router.refresh();
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 min-w-[1280px] items-center gap-4 px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/proposal"
            title="案件一覧へ"
            aria-label={`${APP_NAME}（案件一覧へ）`}
            className="flex items-center gap-2.5 rounded-md outline-none transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-4" />
            </span>
            <span className="text-sm leading-tight font-semibold tracking-tight">
              {APP_NAME}
            </span>
          </Link>

          <Separator orientation="vertical" className="h-6" />
        </div>

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
            <div className="text-right leading-tight">
              <div className="font-medium">{displayName ?? "未ログイン"}</div>
              <div className="text-xs text-muted-foreground">
                {roleLabels[role]}
                {email ? ` · ${email}` : ""}
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleLogout}>
              <LogOut className="size-4" />
              ログアウト
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
