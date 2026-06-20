import type { Metadata } from "next";

import { ProposalProvider } from "@/components/proposal/proposal-context";
import { ProposalShell } from "@/components/proposal/ProposalShell";
import { getAuthContext } from "@/lib/proposal/auth";

export const metadata: Metadata = {
  title: "技術提案書サポート",
  description: "国交省向け・地質調査業務の技術提案書作成サポート",
};

export default async function ProposalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = await getAuthContext();

  return (
    <ProposalProvider
      initialRole={auth?.profile.role ?? "assignee"}
      displayName={auth?.profile.displayName}
      email={auth?.email}
    >
      <div className="min-h-full bg-canvas">
        <ProposalShell>{children}</ProposalShell>
      </div>
    </ProposalProvider>
  );
}
