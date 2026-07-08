import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildDraftGenerationPrompt,
  extractJsonPayload,
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
    pastPerformanceNotes: "",
    relatedWorkNotes: "",
    clientNotesText: "",
    ...overrides,
  };
}

describe("ai-draft", () => {
  const originalStub = process.env.PROPOSAL_AI_STUB;
  const originalAnthropic = process.env.ANTHROPIC_API_KEY;
  const originalOpenAi = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    process.env.PROPOSAL_AI_STUB = "true";
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    if (originalStub === undefined) {
      delete process.env.PROPOSAL_AI_STUB;
    } else {
      process.env.PROPOSAL_AI_STUB = originalStub;
    }
    if (originalAnthropic === undefined) {
      delete process.env.ANTHROPIC_API_KEY;
    } else {
      process.env.ANTHROPIC_API_KEY = originalAnthropic;
    }
    if (originalOpenAi === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalOpenAi;
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

  it("snake_case のキー別名を受け入れる", () => {
    const draft = parseAiDraftResponse(
      JSON.stringify({
        summary: "概要",
        focus_points: "着目点",
        detail: "詳細",
        effects: "効果",
      })
    );
    expect(draft.focusPoints).toBe("着目点");
  });

  it("コードフェンス付き JSON をパースできる", () => {
    const draft = parseAiDraftResponse(
      "```json\n" +
        JSON.stringify({
          summary: "概要",
          focusPoints: "着目点",
          detail: "詳細",
          effects: "効果",
        }) +
        "\n```"
    );
    expect(draft.summary).toBe("概要");
  });

  it("extractJsonPayload は JSON 部分だけを取り出す", () => {
    expect(
      extractJsonPayload('説明文\n{"summary":"a","focusPoints":"b","detail":"c","effects":"d"}')
    ).toBe('{"summary":"a","focusPoints":"b","detail":"c","effects":"d"}');
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

  it("Anthropic キーがあるときは Claude API を呼ぶ", async () => {
    delete process.env.PROPOSAL_AI_STUB;
    process.env.ANTHROPIC_API_KEY = "anthropic-test-key";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              summary: "Claude概要",
              focusPoints: "Claude着目点",
              detail: "Claude詳細",
              effects: "Claude効果",
            }),
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const draft = await generateAiDraftSections(baseCase(), "bid text");

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.anthropic.com/v1/messages");
    const requestBody = JSON.parse(
      String(fetchMock.mock.calls[0]?.[1]?.body)
    ) as Record<string, unknown>;
    expect(requestBody.temperature).toBeUndefined();
    expect(
      (requestBody.output_config as { format?: { type?: string } })?.format
        ?.type
    ).toBe("json_schema");
    expect(draft.summary).toBe("Claude概要");
  });

  it("Anthropic キーが無いときは OpenAI API にフォールバックする", async () => {
    delete process.env.PROPOSAL_AI_STUB;
    process.env.OPENAI_API_KEY = "openai-test-key";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: "OpenAI概要",
                focusPoints: "OpenAI着目点",
                detail: "OpenAI詳細",
                effects: "OpenAI効果",
              }),
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const draft = await generateAiDraftSections(baseCase(), "bid text");

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://api.openai.com/v1/chat/completions"
    );
    expect(draft.summary).toBe("OpenAI概要");
  });
});
