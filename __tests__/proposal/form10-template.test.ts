import { describe, expect, it } from "vitest";

import { buildForm10TemplateData } from "@/lib/proposal/form10-template-data";
import { fillForm10Template } from "@/lib/proposal/word-template";
import { isOfficialForm10SourceAvailable } from "@/lib/proposal/official-form10-fill";
import type { ProposalCase } from "@/lib/proposal/types";

function baseCase(overrides: Partial<ProposalCase> = {}): ProposalCase {
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
      summary: "概要文案",
      focusPoints: "着目点文案",
      detail: "詳細文案",
      effects: "効果文案",
      needsTechnicalReview: false,
      generatedAt: "2026-07-02T00:00:00.000Z",
    },
    currentWordVersion: "v2",
    pastPerformanceNotes: "",
    relatedWorkNotes: "",
    clientNotesText: "",
    ...overrides,
  };
}

describe("form10 template", () => {
  it("案件データをテンプレート用オブジェクトに変換する", () => {
    const data = buildForm10TemplateData(baseCase());
    expect(data.summary).toBe("概要文案");
    expect(data.proposalAxis).toBe("確定した軸");
    expect(data.version).toBe("v2");
  });

  it("様式－１０テンプレートに流し込んで docx を生成する", () => {
    expect(isOfficialForm10SourceAvailable()).toBe(true);
    const buffer = fillForm10Template(baseCase());
    expect(buffer.byteLength).toBeGreaterThan(1000);
    expect(buffer.subarray(0, 2).toString()).toBe("PK");
  });
});
