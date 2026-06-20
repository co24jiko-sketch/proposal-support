"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/lib/proposal/labels";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ProposalLoginForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/proposal";
  const callbackError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(
    callbackError ? "ログインに失敗しました。もう一度お試しください。" : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage("メールアドレスまたはパスワードが正しくありません");
        return;
      }

      // セッション Cookie を Middleware に確実に渡すため、フルリロードで遷移する
      window.location.assign(nextPath);
    } catch {
      setErrorMessage("ログイン処理中にエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <FileText className="size-5" />
            {APP_NAME}
          </div>
          <CardTitle className="text-base font-medium text-muted-foreground">
            パイロット版ログイン
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "ログイン中..." : "ログイン"}
            </Button>
          </form>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Supabase Auth に登録したアカウントでログインしてください。初回ログイン後、管理者が
            SQL でロール（担当者 / 部長 / 支社長）を設定します。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
