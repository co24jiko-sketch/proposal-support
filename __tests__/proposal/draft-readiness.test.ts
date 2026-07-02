import { describe, expect, it } from "vitest";

import { getDraftReadiness } from "@/lib/proposal/draft-readiness";
import type { ProposalCase } from "@/lib/proposal/types";

function baseCase(overrides: Partial<ProposalCase> = {}): ProposalCase {
  return {
    id: "case-test",
    projectName: "テスト案件",
    client: "発注者",
    assigneeName: "担当",
    assigneeId: "user-1",
    status: "ready_to_generate",
    formType: "様式－１０",
    updatedAt: "2026-07-02",
    evaluationTheme: "品質確保",
    proposalAxisDraft: "仮の軸",
    proposalAxisConfirmed: "確定した軸",
    basicInput: {
      projectName: "テスト案件",
      client: "発注者",
      location: "東京都",
      schedule: "",
      surveyPurpose: "調査目的",
      siteKnownInfo: "既知情報",
      surveyPlanOutline: "計画骨子",
    },
    checklistConfirmed: true,
    checklistItems: [{ id: "cl-1", label: "項目", points: 10, confidence: "high" }],
    complianceItems: [],
    managerApproval: null,
    directorApproval: null,
    versions: [],
    auditLog: [],
    referencedLibraryIds: [],
    bidDocumentName: "bid.pdf",
    bidFilePath: "cases/x/bid.pdf",
    generatedSections: {
      summary: false,
      focusPoints: false,
      detail: false,
      effects: false,
    },
    ...overrides,
  };
}

describe("getDraftReadiness", () => {
  it("評価テーマなしの旧案件はチェックリスト確定だけで生成可", () => {
    const readiness = getDraftReadiness(
      baseCase({ evaluationTheme: "", proposalAxisConfirmed: null }),
      false
    );
    expect(readiness.usesStrictChecklist).toBe(false);
    expect(readiness.canGenerate).toBe(true);
  });

  it("評価テーマありで軸未確定のときは生成不可", () => {
    const readiness = getDraftReadiness(
      baseCase({ proposalAxisConfirmed: null }),
      false
    );
    expect(readiness.canGenerate).toBe(false);
    expect(readiness.blockReason).toContain("提案の軸");
  });

  it("必須が揃えば生成可（推奨欠けは警告のみ）", () => {
    const readiness = getDraftReadiness(
      baseCase({
        checklistItems: [],
        basicInput: {
          ...baseCase().basicInput,
          siteKnownInfo: "",
          surveyPlanOutline: "",
        },
      }),
      false
    );
    expect(readiness.canGenerate).toBe(true);
    expect(readiness.hasRecommendedGaps).toBe(true);
  });
});
