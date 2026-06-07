import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProposalCase } from "@/lib/proposal/types";

export function HistoryTab({ caseItem }: { caseItem: ProposalCase }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>版履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {caseItem.versions.length === 0 ? (
              <li className="text-sm text-muted-foreground">版履歴がありません</li>
            ) : (
              caseItem.versions.map((version) => (
                <li
                  key={version.id}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="font-medium">{version.label}</div>
                  <div className="text-muted-foreground">
                    {version.createdAt} — {version.action}
                  </div>
                </li>
              ))
            )}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>操作ログ</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {caseItem.auditLog.length === 0 ? (
              <li className="text-sm text-muted-foreground">ログがありません</li>
            ) : (
              caseItem.auditLog.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="font-medium">
                    {entry.at} — {entry.user}
                  </div>
                  <div>{entry.action}</div>
                  {entry.detail && (
                    <div className="text-muted-foreground">{entry.detail}</div>
                  )}
                </li>
              ))
            )}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
