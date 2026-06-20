"use client";

import { usePathname } from "next/navigation";

import { AppHeader } from "@/components/proposal/AppHeader";
import { SystemStatusBanner } from "@/components/proposal/SystemStatusBanner";

export function ProposalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/proposal/login";

  if (isLoginPage) {
    return children;
  }

  return (
    <>
      <AppHeader />
      <SystemStatusBanner />
      <main>{children}</main>
    </>
  );
}
