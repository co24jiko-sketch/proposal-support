import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { StatusBadge } from "@/components/proposal/StatusBadge";
import { workflowStepLabels } from "@/lib/proposal/labels";
import { getWorkflowStep } from "@/lib/proposal/mock-data";
import type { ProposalCase, UserRole } from "@/lib/proposal/types";
import { getCaseDetailHref } from "@/lib/proposal/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ResumeCaseCardProps = {
  caseItem: ProposalCase;
  role: UserRole;
};

export function ResumeCaseCard({ caseItem, role }: ResumeCaseCardProps) {
  const href = getCaseDetailHref(caseItem, role);
  const stepLabel = workflowStepLabels[getWorkflowStep(caseItem)];

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
        <div className="space-y-1">
          <p className="text-xs font-medium text-primary">続きから</p>
          <p className="font-semibold">{caseItem.projectName}</p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <StatusBadge status={caseItem.status} />
            <span>{stepLabel}</span>
            <span>更新: {caseItem.updatedAt}</span>
          </div>
        </div>
        <Button render={<Link href={href} />}>
          作業を再開
          <ArrowRight />
        </Button>
      </CardContent>
    </Card>
  );
}
