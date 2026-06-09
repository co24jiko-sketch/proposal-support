"use client";



import Link from "next/link";

import { useSearchParams } from "next/navigation";

import { ArrowLeft } from "lucide-react";



import { ProgressStepper } from "@/components/proposal/ProgressStepper";

import { useProposal } from "@/components/proposal/proposal-context";

import { StatusBadge } from "@/components/proposal/StatusBadge";

import { ApprovalTab } from "@/components/proposal/tabs/ApprovalTab";

import { BasicInfoTab } from "@/components/proposal/tabs/BasicInfoTab";

import { ChecklistTab } from "@/components/proposal/tabs/ChecklistTab";

import { ComplianceTab } from "@/components/proposal/tabs/ComplianceTab";

import { DraftTab } from "@/components/proposal/tabs/DraftTab";

import { HistoryTab } from "@/components/proposal/tabs/HistoryTab";

import { getWorkflowStep } from "@/lib/proposal/mock-data";

import { tabLabels } from "@/lib/proposal/labels";

import type { CaseDetailTab, ProposalCase } from "@/lib/proposal/types";

import {

  getDefaultTabForCase,

  getNextAction,

  getTabStatusBadge,

} from "@/lib/proposal/utils";

import { cn } from "@/lib/utils";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";



const tabOrder: CaseDetailTab[] = [

  "basic",

  "checklist",

  "draft",

  "compliance",

  "approval",

  "history",

];



export function CaseDetailPage({ caseItem }: { caseItem: ProposalCase }) {

  const searchParams = useSearchParams();

  const { role } = useProposal();

  const tabParam = searchParams.get("tab") as CaseDetailTab | null;

  const activeTab = tabParam ?? getDefaultTabForCase(caseItem, role);

  const nextAction = getNextAction(caseItem);

  const currentStep = getWorkflowStep(caseItem);

  const nextHref = `/proposal/cases/${caseItem.id}?tab=${nextAction.tab}`;



  return (

    <div className="mx-auto min-w-[1280px] max-w-7xl space-y-4 p-6">

      <div className="flex items-start justify-between gap-4">

        <div className="space-y-2">

          <Button

            variant="ghost"

            size="sm"

            className="-ml-2"

            render={<Link href="/proposal" />}

          >

            <ArrowLeft />

            案件一覧

          </Button>

          <div className="flex flex-wrap items-center gap-3">

            <h1 className="text-2xl font-semibold">{caseItem.projectName}</h1>

            <StatusBadge status={caseItem.status} />

            <span className="text-sm text-muted-foreground">

              {caseItem.formType}

            </span>

          </div>

          <p className="text-sm text-muted-foreground">

            主担当: {caseItem.assigneeName} / 発注者: {caseItem.client}

          </p>

        </div>

        {activeTab !== nextAction.tab && (

          <div className="text-right">

            <Button render={<Link href={nextHref} />}>

              次: {nextAction.label}

            </Button>

            <p className="mt-1.5 max-w-xs text-xs text-muted-foreground">

              {nextAction.hint}

            </p>

          </div>

        )}

      </div>

      {caseItem.status === "returned" && caseItem.returnReason && (
        <Alert variant="destructive">
          <AlertTitle>差し戻し</AlertTitle>
          <AlertDescription>{caseItem.returnReason}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">

        <aside>

          <p className="mb-2 text-sm font-medium">進捗</p>

          <p className="mb-3 text-xs text-muted-foreground">

            ステップをクリックすると該当タブへ移動します

          </p>

          <ProgressStepper

            caseId={caseItem.id}

            currentStep={currentStep}

            activeTab={activeTab}

          />

        </aside>



        <div>

          <Tabs value={activeTab}>

            <TabsList variant="line" className="w-full justify-start">

              {tabOrder.map((tab) => {

                const statusBadge = getTabStatusBadge(caseItem, tab);

                return (

                  <TabsTrigger

                    key={tab}

                    value={tab}

                    render={

                      <Link href={`/proposal/cases/${caseItem.id}?tab=${tab}`} />

                    }

                  >

                    <span className="flex items-center gap-1.5">

                      {tabLabels[tab]}

                      {statusBadge && (

                        <Badge

                          className={cn(

                            "border-transparent px-1.5 py-0 text-[10px] font-normal",

                            statusBadge.className

                          )}

                        >

                          {statusBadge.label}

                        </Badge>

                      )}

                    </span>

                  </TabsTrigger>

                );

              })}

            </TabsList>



            <TabsContent value="basic" className="mt-4">

              <BasicInfoTab caseItem={caseItem} />

            </TabsContent>

            <TabsContent value="checklist" className="mt-4">

              <ChecklistTab caseItem={caseItem} />

            </TabsContent>

            <TabsContent value="draft" className="mt-4">

              <DraftTab caseItem={caseItem} />

            </TabsContent>

            <TabsContent value="compliance" className="mt-4">

              <ComplianceTab caseItem={caseItem} />

            </TabsContent>

            <TabsContent value="approval" className="mt-4">

              <ApprovalTab caseItem={caseItem} />

            </TabsContent>

            <TabsContent value="history" className="mt-4">

              <HistoryTab caseItem={caseItem} />

            </TabsContent>

          </Tabs>

        </div>

      </div>

    </div>

  );

}


