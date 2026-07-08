import { describe, expect, it } from "vitest";
import mammoth from "mammoth";

import { fillOfficialForm10Template } from "@/lib/proposal/official-form10-fill";
import type { ProposalCase } from "@/lib/proposal/types";

function baseCase(): ProposalCase {
  return {
    id: "case-test",
    projectName: "テスト案件",
    client: "発注者",
    assigneeName: "担当",
    assigneeId: "user-1",
    status: "editing",
    formType: "様式－１０",
    updatedAt: "2026-07-02",
    evaluationTheme: "品質確保",
    proposalAxisDraft: "仮の軸",
    proposalAxisConfirmed: "確定した軸",
    basicInput: {
      projectName: "テスト案件",
      client: "発注者",
      location: "東京都",
      schedule: "令和8年度",
      surveyPurpose: "調査目的",
      siteKnownInfo: "既知情報",
      surveyPlanOutline: "計画骨子",
    },
    checklistConfirmed: true,
    checklistItems: [],
    complianceItems: [],
    managerApproval: null,
    directorApproval: null,
    versions: [],
    auditLog: [],
    referencedLibraryIds: [],
    generatedSections: {
      summary: true,
      focusPoints: true,
      detail: true,
      effects: true,
    },
    draftSections: {
      summary: "概要文案テスト",
      focusPoints: "着目点文案テスト",
      detail: "詳細文案テスト",
      effects: "効果文案テスト",
      needsTechnicalReview: false,
      generatedAt: "2026-07-02T00:00:00.000Z",
    },
    currentWordVersion: "v2",
    pastPerformanceNotes: "",
    relatedWorkNotes: "",
    clientNotesText: "",
  };
}

describe("official form10 fill", () => {
  it("高山資料様式の見出しと文案が docx に入る", async () => {
    const buffer = fillOfficialForm10Template(baseCase());
    const { value } = await mammoth.extractRawText({ buffer });
    expect(value).toContain("（様式－１０）");
    expect(value).toContain("概要文案テスト");
    expect(value).toContain("着目点文案テスト");
    expect(value).toContain("詳細文案テスト");
    expect(value).toContain("効果文案テスト");
  });
});
