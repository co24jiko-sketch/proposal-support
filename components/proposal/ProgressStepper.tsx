import Link from "next/link";

import type { WorkflowStepId } from "@/lib/proposal/types";
import { workflowStepLabels } from "@/lib/proposal/labels";
import {
  WORKFLOW_STEPS,
  getWorkflowStepIndex,
  getWorkflowStepLockReason,
  isWorkflowStepReachable,
  workflowStepToTab,
} from "@/lib/proposal/utils";
import { cn } from "@/lib/utils";
import { Check, Lock } from "lucide-react";

type ProgressStepperProps = {
  caseId: string;
  currentStep: WorkflowStepId;
  activeTab?: string;
};

export function ProgressStepper({
  caseId,
  currentStep,
  activeTab,
}: ProgressStepperProps) {
  const currentIndex = getWorkflowStepIndex(currentStep);

  return (
    <ol className="space-y-2">
      {WORKFLOW_STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const reachable = isWorkflowStepReachable(currentStep, step);
        const tab = workflowStepToTab[step];
        const isTabActive = activeTab === tab;
        const href = `/proposal/cases/${caseId}?tab=${tab}`;

        const content = (
          <>
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-xs",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary text-primary",
                !reachable && "border-muted-foreground/30 text-muted-foreground"
              )}
            >
              {done ? (
                <Check className="size-3" />
              ) : !reachable ? (
                <Lock className="size-2.5" />
              ) : (
                index + 1
              )}
            </span>
            <span className={cn(active && "font-medium")}>
              {workflowStepLabels[step]}
            </span>
          </>
        );

        return (
          <li key={step}>
            {reachable ? (
              <Link
                href={href}
                className={cn(
                  "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50",
                  (active || isTabActive) && "border-primary bg-primary/5",
                  done && !active && "text-muted-foreground"
                )}
              >
                {content}
              </Link>
            ) : (
              <div className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground opacity-60">
                <div className="flex items-start gap-2">{content}</div>
                <p className="mt-1.5 pl-7 text-[11px] leading-snug">
                  {getWorkflowStepLockReason(step)}
                </p>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
