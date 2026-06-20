import { Suspense } from "react";

import { ProposalLoginForm } from "@/components/proposal/ProposalLoginForm";

export default function ProposalLoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">読み込み中...</div>}>
      <ProposalLoginForm />
    </Suspense>
  );
}
