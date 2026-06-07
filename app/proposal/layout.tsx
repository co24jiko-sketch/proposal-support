import type { Metadata } from "next";

import { AppHeader } from "@/components/proposal/AppHeader";
import { ProposalProvider } from "@/components/proposal/proposal-context";
import { SystemStatusBanner } from "@/components/proposal/SystemStatusBanner";

export const metadata: Metadata = {
  title: "技術提案書サポート",
  description: "国交省向け・地質調査業務の技術提案書作成サポート（UIプロトタイプ）",
};

export default function ProposalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProposalProvider>
      <div className="min-h-full bg-canvas">
        <AppHeader />
        <SystemStatusBanner />
        <main>{children}</main>
      </div>
    </ProposalProvider>
  );
}
