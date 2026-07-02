import type { DraftSectionsContent, ProposalCase } from "@/lib/proposal/types";
import {
  assertLlmConfigured,
  getAnthropicApiKey,
  getClaudeModel,
  getLlmProvider,
  getOpenAiApiKey,
  getOpenAiModel,
  isAiStubMode,
} from "@/lib/proposal/llm-config";

export const FORBIDDEN_DRAFT_PHRASES = [
  "必要に応じて",
  "に努める",
  "努める",
  "できる限り",
] as const;

export type AiDraftSectionKey = keyof Pick<
  DraftSectionsContent,
  "summary" | "focusPoints" | "detail" | "effects"
>;

const SECTION_KEYS: AiDraftSectionKey[] = [
  "summary",
  "focusPoints",
  "detail",
  "effects",
];

type RawAiDraftResponse = Partial<Record<AiDraftSectionKey, unknown>>;

export type GenerateAiDraftOptions = {
  llmStopped?: boolean;
};

function hasSiteContext(caseItem: ProposalCase): boolean {
  const { basicInput } = caseItem;
  return Boolean(
    basicInput.siteKnownInfo.trim() && basicInput.surveyPlanOutline.trim()
  );
}

function formatChecklistForPrompt(caseItem: ProposalCase): string {
  if (caseItem.checklistItems.length === 0) {
    return "（採点項目なし）";
  }

  return caseItem.checklistItems
    .map((item) => `- ${item.label}（${item.points}点）`)
    .join("\n");
}

export function buildDraftGenerationPrompt(
  caseItem: ProposalCase,
  bidDocumentText: string
): { system: string; user: string } {
  const { basicInput } = caseItem;
  const proposalAxis =
    caseItem.proposalAxisConfirmed?.trim() ||
    caseItem.proposalAxisDraft.trim() ||
    "（未設定）";

  const system = [
    "あなたは日本の公共工事・地質調査向け技術提案書の文案作成アシスタントです。",
    "出力は提出前の下書きであり、最終責任は担当技術者にあります。",
    "提案は1案のみ。複数案や比較案は書かないでください。",
    "次のあいまい表現は禁止: 「必要に応じて」「～に努める」「できる限り」。",
    "断定的な表現（「～する」「～を実施する」）を使い、手順・着目点・効果は番号付き（（１）（２）…）で書いてください。",
    "入札図書の評価ルール・留意事項を外さないこと。着目点の具体性は既知情報・計画骨子・専門判断に基づくこと。",
    "JSON のみを返してください。キーは summary, focusPoints, detail, effects の4つです。",
  ].join("\n");

  const user = [
    "## 案件情報",
    `評価テーマ: ${caseItem.evaluationTheme || "（未設定）"}`,
    `提案の軸（確定）: ${proposalAxis}`,
    `件名: ${basicInput.projectName}`,
    `発注者: ${basicInput.client}`,
    `場所: ${basicInput.location}`,
    `工期: ${basicInput.schedule || "（未入力）"}`,
    `調査目的・範囲: ${basicInput.surveyPurpose}`,
    `既知の地質情報: ${basicInput.siteKnownInfo || "（未入力）"}`,
    `調査計画の骨子: ${basicInput.surveyPlanOutline || "（未入力）"}`,
    "",
    "## 採点項目（評価観点の参考）",
    formatChecklistForPrompt(caseItem),
    "",
    "## 入札図書から抽出したテキスト（評価ルール・留意事項の参考）",
    bidDocumentText || "（テキスト抽出なし）",
    "",
    "## 各欄の要件",
    "- summary: １）提案の概要。軸を冒頭に1行、その後2〜3文で背景・課題・狙い。「～と考える」で締める。",
    "- focusPoints: ① 着目点。番号付き。業務内容と提案内容の関係が伝わること。",
    "- detail: ② 詳細な内容。手順（１）（２）…。体制・方法を具体的に。",
    "- effects: ③ 効果。効果（１）（２）…。可能なら定量的。実績が無ければ手法の妥当性で書く。",
  ].join("\n");

  return { system, user };
}

export function findForbiddenPhrases(text: string): string[] {
  return FORBIDDEN_DRAFT_PHRASES.filter((phrase) => text.includes(phrase));
}

function normalizeSectionText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function parseAiDraftResponse(raw: string): DraftSectionsContent {
  let parsed: RawAiDraftResponse;
  try {
    parsed = JSON.parse(extractJsonPayload(raw)) as RawAiDraftResponse;
  } catch {
    throw new Error("AI 文案の応答を JSON として解析できませんでした");
  }

  const sections = {
    summary: normalizeSectionText(parsed.summary),
    focusPoints: normalizeSectionText(parsed.focusPoints),
    detail: normalizeSectionText(parsed.detail),
    effects: normalizeSectionText(parsed.effects),
  };

  for (const key of SECTION_KEYS) {
    if (!sections[key]) {
      throw new Error(`AI 文案に ${key} が含まれていません`);
    }
  }

  const combined = SECTION_KEYS.map((key) => sections[key]).join("\n");
  const forbidden = findForbiddenPhrases(combined);

  return {
    ...sections,
    needsTechnicalReview: forbidden.length > 0,
    generatedAt: new Date().toISOString(),
  };
}

export function extractJsonPayload(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}

function buildStubDraft(caseItem: ProposalCase): DraftSectionsContent {
  const { basicInput } = caseItem;
  const axis =
    caseItem.proposalAxisConfirmed?.trim() ||
    caseItem.proposalAxisDraft.trim() ||
    basicInput.surveyPurpose;
  const theme = caseItem.evaluationTheme || "品質確保";

  return {
    summary: [
      `${axis}を軸に、${theme}を重視した提案とする。`,
      `${basicInput.client}が発注する「${basicInput.projectName}」（${basicInput.location}）について、${basicInput.surveyPurpose}を目的に調査を実施する。`,
      "入札図書の留意事項と既知情報を踏まえ、後続業務に引き継ぎやすい成果を得ると考える。",
    ].join("\n"),
    focusPoints: [
      "（１）発注者が明示した留意事項への対応",
      `${basicInput.siteKnownInfo || "現地の地質条件"}を踏まえ、調査対象の特性に即した着眼点を設定する。`,
      "（２）提案の軸の実現",
      `${axis}を実現するため、調査手順と品質管理の着眼点を明確にする。`,
      "（３）採点観点との整合",
      "評価テーマと採点項目で求められる論点を漏れなく提案内容に反映する。",
    ].join("\n"),
    detail: [
      "手順（１）事前調査・資料収集",
      "既存資料と現地情報を整理し、調査計画の前提を確定する。",
      "手順（２）現地調査の実施",
      basicInput.surveyPlanOutline ||
        "計画に基づきボーリング・試験等を実施し、地質構造を把握する。",
      "手順（３）解析・評価と成果品作成",
      "取得データを解析し、設計・施工に資する地質情報を整理して報告する。",
    ].join("\n"),
    effects: [
      "効果（１）調査精度の確保",
      "系統的な手順により、設計に必要な地質情報を的確に提供する。",
      "効果（２）後続業務への円滑な引継ぎ",
      "提案の軸に沿った成果品により、後続の設計・施工判断を支援する。",
    ].join("\n"),
    needsTechnicalReview: !hasSiteContext(caseItem),
    generatedAt: new Date().toISOString(),
  };
}

async function callAnthropicDraft(
  caseItem: ProposalCase,
  bidDocumentText: string
): Promise<DraftSectionsContent> {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY が未設定です");
  }

  const { system, user } = buildDraftGenerationPrompt(caseItem, bidDocumentText);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getClaudeModel(),
      max_tokens: 4096,
      temperature: 0.4,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Claude 文案生成 API が失敗しました（${response.status}）${detail ? `: ${detail.slice(0, 200)}` : ""}`
    );
  }

  const payload = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const content = payload.content
    ?.filter((block) => block.type === "text")
    .map((block) => block.text ?? "")
    .join("")
    .trim();

  if (!content) {
    throw new Error("Claude 文案生成 API から空の応答が返りました");
  }

  const draft = parseAiDraftResponse(content);
  if (!hasSiteContext(caseItem)) {
    return { ...draft, needsTechnicalReview: true };
  }
  return draft;
}

async function callOpenAiDraft(
  caseItem: ProposalCase,
  bidDocumentText: string
): Promise<DraftSectionsContent> {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY が未設定です");
  }

  const { system, user } = buildDraftGenerationPrompt(caseItem, bidDocumentText);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getOpenAiModel(),
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `OpenAI 文案生成 API が失敗しました（${response.status}）${detail ? `: ${detail.slice(0, 200)}` : ""}`
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI 文案生成 API から空の応答が返りました");
  }

  const draft = parseAiDraftResponse(content);
  if (!hasSiteContext(caseItem)) {
    return { ...draft, needsTechnicalReview: true };
  }
  return draft;
}

async function callLlmDraft(
  caseItem: ProposalCase,
  bidDocumentText: string
): Promise<DraftSectionsContent> {
  const provider = getLlmProvider();
  if (provider === "anthropic") {
    return callAnthropicDraft(caseItem, bidDocumentText);
  }
  if (provider === "openai") {
    return callOpenAiDraft(caseItem, bidDocumentText);
  }

  throw new Error(
    "LLM API キーが未設定です。ANTHROPIC_API_KEY または OPENAI_API_KEY を設定してください"
  );
}

export async function generateAiDraftSections(
  caseItem: ProposalCase,
  bidDocumentText: string,
  options: GenerateAiDraftOptions = {}
): Promise<DraftSectionsContent> {
  if (options.llmStopped) {
    throw new Error("LLMサービス停止中のため、文案の生成は利用できません");
  }

  assertLlmConfigured();

  if (isAiStubMode()) {
    return buildStubDraft(caseItem);
  }

  return callLlmDraft(caseItem, bidDocumentText);
}
