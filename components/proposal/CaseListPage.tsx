"use client";



import Link from "next/link";

import { useEffect, useMemo, useState } from "react";

import { ChevronRight, Plus } from "lucide-react";

import { useRouter } from "next/navigation";



import { ResumeCaseCard } from "@/components/proposal/ResumeCaseCard";

import { useProposal } from "@/components/proposal/proposal-context";

import { StatusBadge } from "@/components/proposal/StatusBadge";

import { ComplianceSummaryBadges } from "@/components/proposal/ComplianceTable";

import { getComplianceSummary, getWorkflowStep } from "@/lib/proposal/mock-data";

import { workflowStepLabels } from "@/lib/proposal/labels";

import type { ProposalCase, UserRole } from "@/lib/proposal/types";

import {

  getCaseDetailHref,

  isPendingApprovalForRole,

} from "@/lib/proposal/utils";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {

  Table,

  TableBody,

  TableCell,

  TableHead,

  TableHeader,

  TableRow,

} from "@/components/ui/table";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";



function CaseTable({

  cases,

  role,

  showCompliance = false,

}: {

  cases: ProposalCase[];

  role: UserRole;

  showCompliance?: boolean;

}) {

  const router = useRouter();



  if (cases.length === 0) {

    return (

      <p className="py-8 text-center text-sm text-muted-foreground">

        該当する案件がありません。

      </p>

    );

  }



  return (

    <Table>

      <TableHeader>

        <TableRow>

          <TableHead>工事名</TableHead>

          <TableHead>現在ステップ</TableHead>

          <TableHead>主担当</TableHead>

          <TableHead>ステータス</TableHead>

          {showCompliance && <TableHead>△×</TableHead>}

          <TableHead>更新日</TableHead>

          <TableHead className="w-8" />

        </TableRow>

      </TableHeader>

      <TableBody>

        {cases.map((item) => {

          const summary = getComplianceSummary(item);

          const href = getCaseDetailHref(item, role);

          const stepLabel = workflowStepLabels[getWorkflowStep(item)];



          return (

            <TableRow

              key={item.id}

              className="cursor-pointer hover:bg-muted/50"

              onClick={() => router.push(href)}

            >

              <TableCell className="font-medium">

                <div>

                  <p>{item.projectName}</p>

                  <p className="text-xs text-muted-foreground">{item.client}</p>

                </div>

              </TableCell>

              <TableCell className="text-sm text-muted-foreground">

                {stepLabel}

              </TableCell>

              <TableCell>{item.assigneeName}</TableCell>

              <TableCell>

                <StatusBadge status={item.status} />

              </TableCell>

              {showCompliance && (

                <TableCell>

                  {item.complianceItems.length > 0 ? (

                    <ComplianceSummaryBadges {...summary} />

                  ) : (

                    <span className="text-xs text-muted-foreground">—</span>

                  )}

                </TableCell>

              )}

              <TableCell>{item.updatedAt}</TableCell>

              <TableCell>

                <ChevronRight className="size-4 text-muted-foreground" />

              </TableCell>

            </TableRow>

          );

        })}

      </TableBody>

    </Table>

  );

}



function pickResumeCase(cases: ProposalCase[]): ProposalCase | undefined {

  if (cases.length === 0) return undefined;

  return [...cases].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

}



export function CaseListPage() {

  const { role } = useProposal();

  const [cases, setCases] = useState<ProposalCase[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState<string | null>(null);

  const [tab, setTab] = useState(

    role === "manager" || role === "director" ? "pending" : "mine"

  );



  useEffect(() => {

    async function loadCases() {

      setIsLoading(true);

      setLoadError(null);

      try {

        const response = await fetch("/api/proposal/cases");

        const data = await response.json();

        if (!response.ok) {

          throw new Error(data.error ?? "案件一覧の取得に失敗しました");

        }

        setCases(data);

      } catch (error) {

        setLoadError(

          error instanceof Error ? error.message : "案件一覧の取得に失敗しました"

        );

      } finally {

        setIsLoading(false);

      }

    }



    loadCases();

  }, []);



  const pendingCases = useMemo(

    () => cases.filter((item) => isPendingApprovalForRole(role, item)),

    [cases, role]

  );



  const myCases = useMemo(

    () => cases.filter((item) => item.assigneeName === "山田 太郎"),

    [cases]

  );



  const isApprover = role === "manager" || role === "director";

  const resumeCase = useMemo(() => {

    if (isApprover) return pickResumeCase(pendingCases);

    return pickResumeCase(myCases);

  }, [isApprover, pendingCases, myCases]);



  const showComplianceColumn = isApprover;



  return (

    <div className="mx-auto min-w-[1280px] max-w-7xl space-y-6 p-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-semibold">案件一覧</h1>

          <p className="text-sm text-muted-foreground">

            行をクリックすると、現在のステップに応じたタブが開きます

          </p>

        </div>

        {(role === "assignee" || role === "admin") && (

          <Button render={<Link href="/proposal/cases/new" />}>

            <Plus />

            新規案件

          </Button>

        )}

      </div>



      {loadError && (

        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">

          {loadError}

        </p>

      )}



      {isLoading ? (

        <p className="text-sm text-muted-foreground">案件を読み込み中...</p>

      ) : (

        <>

      {resumeCase && (

        <ResumeCaseCard caseItem={resumeCase} role={role} />

      )}



      {isApprover ? (

        <Tabs value={tab} onValueChange={setTab}>

          <TabsList>

            <TabsTrigger value="pending">

              承認待ち ({pendingCases.length})

            </TabsTrigger>

            <TabsTrigger value="all">すべて</TabsTrigger>

          </TabsList>

          <TabsContent value="pending" className="mt-4">

            <Card>

              <CardHeader>

                <CardTitle>承認待ち</CardTitle>

              </CardHeader>

              <CardContent>

                <CaseTable

                  cases={pendingCases}

                  role={role}

                  showCompliance={showComplianceColumn}

                />

              </CardContent>

            </Card>

          </TabsContent>

          <TabsContent value="all" className="mt-4">

            <Card>

              <CardContent className="pt-6">

                <CaseTable

                  cases={cases}

                  role={role}

                  showCompliance={showComplianceColumn}

                />

              </CardContent>

            </Card>

          </TabsContent>

        </Tabs>

      ) : (

        <Tabs value={tab} onValueChange={setTab}>

          <TabsList>

            <TabsTrigger value="mine">自分の案件</TabsTrigger>

            <TabsTrigger value="all">すべて</TabsTrigger>

          </TabsList>

          <TabsContent value="mine" className="mt-4">

            <Card>

              <CardContent className="pt-6">

                <CaseTable cases={myCases} role={role} />

              </CardContent>

            </Card>

          </TabsContent>

          <TabsContent value="all" className="mt-4">

            <Card>

              <CardContent className="pt-6">

                <CaseTable cases={cases} role={role} />

              </CardContent>

            </Card>

          </TabsContent>

        </Tabs>

      )}

        </>

      )}

    </div>

  );

}


