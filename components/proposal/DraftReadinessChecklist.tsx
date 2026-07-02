import { AlertTriangle, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DraftReadiness } from "@/lib/proposal/draft-readiness";
import { cn } from "@/lib/utils";

type DraftReadinessChecklistProps = {
  readiness: DraftReadiness;
};

export function DraftReadinessChecklist({
  readiness,
}: DraftReadinessChecklistProps) {
  if (!readiness.usesStrictChecklist || readiness.items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>文案生成前チェックリスト</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ul className="flex flex-col gap-2">
          {readiness.items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-2 rounded-lg border px-3 py-2 text-sm"
            >
              {item.ok ? (
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              ) : (
                <AlertTriangle
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    item.level === "required"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}
                />
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span>{item.label}</span>
                  <Badge variant="outline">
                    {item.level === "required" ? "必須" : "推奨"}
                  </Badge>
                  <Badge variant={item.ok ? "secondary" : "outline"}>
                    {item.ok ? "OK" : "未完了"}
                  </Badge>
                </div>
                {!item.ok && item.hint && (
                  <p className="text-xs text-muted-foreground">{item.hint}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
        {readiness.hasRecommendedGaps && readiness.canGenerate && (
          <p className="text-xs text-muted-foreground">
            推奨項目が未入力です。初稿生成は続行できますが、文案の具体性が弱くなる可能性があります。
          </p>
        )}
        {!readiness.canGenerate && readiness.blockReason && (
          <p className="text-xs text-destructive">{readiness.blockReason}</p>
        )}
      </CardContent>
    </Card>
  );
}
