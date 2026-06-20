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
  displayName: string | null;
  email: string | null;
  llmStopped: boolean;
  setLlmStopped: (stopped: boolean) => void;
};

const ProposalContext = createContext<ProposalContextValue | null>(null);

type ProposalProviderProps = {
  children: ReactNode;
  initialRole: UserRole;
  displayName?: string | null;
  email?: string | null;
};

export function ProposalProvider({
  children,
  initialRole,
  displayName = null,
  email = null,
}: ProposalProviderProps) {
  const [llmStopped, setLlmStoppedState] = useState(false);

  const setLlmStopped = useCallback((stopped: boolean) => {
    setLlmStoppedState(stopped);
  }, []);

  const value = useMemo(
    () => ({
      role: initialRole,
      displayName,
      email,
      llmStopped,
      setLlmStopped,
    }),
    [initialRole, displayName, email, llmStopped, setLlmStopped]
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