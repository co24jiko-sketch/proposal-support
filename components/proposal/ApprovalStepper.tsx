import type { ProposalCase } from "@/lib/proposal/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type ApprovalStepperProps = {
  caseItem: ProposalCase;
};

export function ApprovalStepper({ caseItem }: ApprovalStepperProps) {
  const managerDone = Boolean(caseItem.managerApproval);
  const directorDone = Boolean(caseItem.directorApproval);
  const managerActive = caseItem.status === "pending_manager";
  const directorActive = caseItem.status === "pending_director";

  const steps = [
    {
      label: "担当 申請",
      done: ["pending_manager", "pending_director", "approved"].includes(
        caseItem.status
      ),
      active: false,
    },
    {
      label: "部長承認",
      done: managerDone || directorDone,
      active: managerActive,
      detail: caseItem.managerApproval?.approverName,
    },
    {
      label: "支社長承認",
      done: directorDone,
      active: directorActive,
      detail: caseItem.directorApproval?.approverName,
    },
    {
      label: "PDF出力",
      done: caseItem.status === "approved",
      active: caseItem.status === "approved",
    },
  ];

  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {steps.map((step, index) => (
        <li key={step.label} className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1",
              step.active && "border-primary bg-primary/5 font-medium",
              step.done && !step.active && "text-muted-foreground"
            )}
          >
            {step.done && <Check className="size-3" />}
            {step.label}
            {step.detail ? `（${step.detail}）` : ""}
          </span>
          {index < steps.length - 1 && (
            <span className="text-muted-foreground">→</span>
          )}
        </li>
      ))}
    </ol>
  );
}
