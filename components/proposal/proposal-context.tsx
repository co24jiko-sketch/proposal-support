"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { UserRole } from "@/lib/proposal/types";

type ProposalContextValue = {
  role: UserRole;
  setRole: (role: UserRole) => void;
  llmStopped: boolean;
  setLlmStopped: (stopped: boolean) => void;
};

const ProposalContext = createContext<ProposalContextValue | null>(null);

export function ProposalProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("assignee");
  const [llmStopped, setLlmStopped] = useState(false);

  const setRole = useCallback((next: UserRole) => {
    setRoleState(next);
  }, []);

  const value = useMemo(
    () => ({ role, setRole, llmStopped, setLlmStopped }),
    [role, setRole, llmStopped]
  );

  return (
    <ProposalContext.Provider value={value}>{children}</ProposalContext.Provider>
  );
}

export function useProposal() {
  const context = useContext(ProposalContext);
  if (!context) {
    throw new Error("useProposal must be used within ProposalProvider");
  }
  return context;
}
