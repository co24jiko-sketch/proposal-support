import { Suspense } from "react";
import { notFound } from "next/navigation";

import { CaseDetailPage } from "@/components/proposal/CaseDetailPage";
import { getProposalCaseById } from "@/lib/proposal/case-repository";
import { getCaseById as getMockCaseById } from "@/lib/proposal/mock-data";
import { Skeleton } from "@/components/ui/skeleton";

type PageProps = {
  params: Promise<{ id: string }>;
};

function CaseDetailFallback() {
  return (
    <div className="mx-auto min-w-[1280px] max-w-7xl space-y-4 p-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export default async function CaseDetailRoute({ params }: PageProps) {
  const { id } = await params;
  const caseItem =
    (await getProposalCaseById(id)) ?? getMockCaseById(id);

  if (!caseItem) {
    notFound();
  }

  return (
    <Suspense fallback={<CaseDetailFallback />}>
      <CaseDetailPage caseItem={caseItem} />
    </Suspense>
  );
}
