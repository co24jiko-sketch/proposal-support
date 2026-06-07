import Link from "next/link";

import { ChevronRight } from "lucide-react";



import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";

import type { ProposalCase } from "@/lib/proposal/types";



export function BasicInfoTab({ caseItem }: { caseItem: ProposalCase }) {

  const fields = [

    ["工事名", caseItem.basicInput.projectName],

    ["発注者", caseItem.basicInput.client],

    ["場所", caseItem.basicInput.location],

    ["工期目安", caseItem.basicInput.schedule],

    ["調査目的・範囲", caseItem.basicInput.surveyPurpose],

    ["対象地既知", caseItem.basicInput.siteKnownInfo],

    ["調査計画骨子", caseItem.basicInput.surveyPlanOutline],

  ] as const;



  const checklistHref = `/proposal/cases/${caseItem.id}?tab=checklist`;



  return (

    <Card>

      <CardHeader>

        <CardTitle>案件基本情報（必須4項目）</CardTitle>

      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-2">

        {fields.map(([label, value]) => (

          <div

            key={label}

            className={

              label.includes("調査") || label.includes("対象")

                ? "md:col-span-2"

                : undefined

            }

          >

            <Label className="text-muted-foreground">{label}</Label>

            <p className="mt-1 whitespace-pre-wrap text-sm">{value}</p>

          </div>

        ))}

      </CardContent>

      {!caseItem.checklistConfirmed && (

        <CardFooter className="justify-end border-t">

          <Button render={<Link href={checklistHref} />}>

            チェックリストへ進む

            <ChevronRight />

          </Button>

        </CardFooter>

      )}

    </Card>

  );

}


