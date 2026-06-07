import type { CaseStatus } from "@/lib/proposal/types";
import { caseStatusLabels } from "@/lib/proposal/labels";
import { getStatusBadgeVariant } from "@/lib/proposal/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: CaseStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant={getStatusBadgeVariant(status)}
      className={cn(className)}
    >
      {caseStatusLabels[status]}
    </Badge>
  );
}
