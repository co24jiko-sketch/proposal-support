import type { ComplianceItem } from "@/lib/proposal/types";
import { judgmentLabels } from "@/lib/proposal/labels";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type ComplianceTableProps = {
  items: ComplianceItem[];
  compact?: boolean;
};

function judgmentBadgeClass(judgment: ComplianceItem["judgment"]) {
  switch (judgment) {
    case "ok":
      return "bg-emerald-100 text-emerald-800";
    case "partial":
      return "bg-amber-100 text-amber-900";
    case "missing":
      return "bg-red-100 text-red-800";
  }
}

export function ComplianceTable({ items, compact = false }: ComplianceTableProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        適合チェック結果がありません。Word再取込後に実行してください。
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>採点項目</TableHead>
          <TableHead>判定</TableHead>
          <TableHead>根拠</TableHead>
          {!compact && <TableHead>次のアクション</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="max-w-[220px] whitespace-normal">
              {item.label}
            </TableCell>
            <TableCell>
              <Badge className={cn("border-transparent", judgmentBadgeClass(item.judgment))}>
                {judgmentLabels[item.judgment]}
              </Badge>
            </TableCell>
            <TableCell className="max-w-[260px] whitespace-normal text-muted-foreground">
              {item.evidence}
            </TableCell>
            {!compact && (
              <TableCell className="max-w-[220px] whitespace-normal">
                {item.nextAction ?? "—"}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ComplianceSummaryBadges({
  ok,
  partial,
  missing,
}: {
  ok: number;
  partial: number;
  missing: number;
}) {
  return (
    <div className="flex flex-wrap gap-2 text-sm">
      <Badge className="border-transparent bg-emerald-100 text-emerald-800">
        ○ {ok}
      </Badge>
      <Badge className="border-transparent bg-amber-100 text-amber-900">
        △ {partial}
      </Badge>
      <Badge className="border-transparent bg-red-100 text-red-800">
        × {missing}
      </Badge>
    </div>
  );
}
