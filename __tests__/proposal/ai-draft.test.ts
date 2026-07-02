import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildDraftGenerationPrompt,
  findForbiddenPhrases,
  generateAiDraftSections,
  parseAiDraftResponse,
} from "@/lib/proposal/ai-draft";
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

describe("ai-draft", () => {
  const originalStub = process.env.PROPOSAL_AI_STUB;

  beforeEach(() => {
    process.env.PROPOSAL_AI_STUB = "true";
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    if (originalStub === undefined) {
      delete process.env.PROPOSAL_AI_STUB;
    } else {
      process.env.PROPOSAL_AI_STUB = originalStub;
    }
    vi.restoreAllMocks();
  });

  it("禁止表現を検出する", () => {
    expect(findForbiddenPhrases("必要に応じて対応する")).toContain(
      "必要に応じて"
    );
    expect(findForbiddenPhrases("品質に努める")).toContain("に努める");
  });

  it("AI 応答 JSON を4欄にパースする", () => {
    const draft = parseAiDraftResponse(
      JSON.stringify({
        summary: "概要",
        focusPoints: "着目点",
        detail: "詳細",
        effects: "効果",
      })
    );
    expect(draft.summary).toBe("概要");
    expect(draft.needsTechnicalReview).toBe(false);
  });

  it("禁止表現を含む応答は要確認フラグを立てる", () => {
    const draft = parseAiDraftResponse(
      JSON.stringify({
        summary: "必要に応じて実施する",
        focusPoints: "着目点",
        detail: "詳細",
        effects: "効果",
      })
    );
    expect(draft.needsTechnicalReview).toBe(true);
  });

  it("プロンプトに評価テーマと軸を含める", () => {
    const { user } = buildDraftGenerationPrompt(baseCase(), "入札図書テキスト");
    expect(user).toContain("品質確保");
    expect(user).toContain("確定した軸");
    expect(user).toContain("入札図書テキスト");
  });

  it("スタブモードで4欄を生成する", async () => {
    const draft = await generateAiDraftSections(baseCase(), "bid text");
    expect(draft.summary.length).toBeGreaterThan(0);
    expect(draft.focusPoints.length).toBeGreaterThan(0);
    expect(draft.detail.length).toBeGreaterThan(0);
    expect(draft.effects.length).toBeGreaterThan(0);
  });

  it("LLM 停止中は生成を拒否する", async () => {
    await expect(
      generateAiDraftSections(baseCase(), "", { llmStopped: true })
    ).rejects.toThrow("LLMサービス停止中");
  });
});
