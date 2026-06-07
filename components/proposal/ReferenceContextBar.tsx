import Link from "next/link";
import { ChevronRight, FileText, ListChecks } from "lucide-react";

import { getComplianceSummary } from "@/lib/proposal/mock-data";
import type { ProposalCase } from "@/lib/proposal/types";
import { Button } from "@/components/ui/button";

type ReferenceContextBarProps = {
  caseItem: ProposalCase;
  showChecklistLink?: boolean;
};

export function ReferenceContextBar({
  caseItem,
  showChecklistLink = false,
}: ReferenceContextBarProps) {
  const summary = getComplianceSummary(caseItem);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border bg-muted/30 px-4 py-2.5 text-sm">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <FileText className="size-4 shrink-0" />
        入札図書: {caseItem.bidDocumentName ?? "未アップロード"}
      </span>
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <ListChecks className="size-4 shrink-0" />
        採点項目 {caseItem.checklistItems.length}件
        {caseItem.checklistConfirmed ? "（確定済）" : "（未確定）"}
      </span>
      {caseItem.complianceItems.length > 0 && (
        <span className="text-muted-foreground">
          適合 ○{summary.ok} △{summary.partial} ×{summary.missing}
        </span>
      )}
      {showChecklistLink && !caseItem.checklistConfirmed && (
        <Button
          size="sm"
          variant="link"
          className="ml-auto h-auto gap-1 p-0"
          render={
            <Link href={`/proposal/cases/${caseItem.id}?tab=checklist`} />
          }
        >
          チェックリストを確認
          <ChevronRight className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
