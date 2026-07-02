import { extractJsonPayload } from "@/lib/proposal/ai-draft";
import {
  AI_GUIDELINE_RULES,
  getDraftSectionText,
  type GuidelineRule,
} from "@/lib/proposal/guideline-rules";
import {
  getAnthropicApiKey,
  getClaudeModel,
} from "@/lib/proposal/llm-config";
import type {
  ComplianceItem,
  ComplianceJudgment,
  DraftSectionsContent,
} from "@/lib/proposal/types";

type AiGuidelineResult = {
  ruleId: string;
  judgment: ComplianceJudgment;
  evidence: string;
  nextAction?: string;
};

const AI_GUIDELINE_JSON_SCHEMA = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          ruleId: { type: "string" },
          judgment: { type: "string", enum: ["ok", "partial", "missing"] },
          evidence: { type: "string" },
          nextAction: { type: "string" },
        },
        required: ["ruleId", "judgment", "evidence"],
        additionalProperties: false,
      },
    },
  },
  required: ["results"],
  additionalProperties: false,
} as const;

function buildAiGuidelinePrompt(draft: DraftSectionsContent): {
  system: string;
  user: string;
} {
  const rulesText = AI_GUIDELINE_RULES.map(
    (rule) =>
      `- ${rule.id}: ${rule.label}（対象: ${rule.section}）\n  ${rule.description}`
  ).join("\n");

  const system = [
    "あなたは日本の公共工事向け技術提案書の記載ルール審査アシスタントです。",
    "与えられた4欄の下書きが、各記載ルールを満たしているかを判定してください。",
    "判定は ok（適合）/ partial（一部不足）/ missing（不適合）のいずれかです。",
    "new-approach-comparison は、新たな取り組みが文案に無い場合は ok とし、根拠に「該当なし」と書いてください。",
    "JSON のみを返してください。",
  ].join("\n");

  const user = [
    "## 記載ルール",
    rulesText,
    "",
    "## 下書き（4欄）",
    "### summary（提案の概要）",
    draft.summary,
    "",
    "### focusPoints（着目点）",
    draft.focusPoints,
    "",
    "### detail（詳細な内容）",
    draft.detail,
    "",
    "### effects（効果）",
    draft.effects,
    "",
    "## 出力",
    "results 配列に、上記ルール id ごとの判定を返してください。",
  ].join("\n");

  return { system, user };
}

export function parseAiGuidelineResponse(raw: string): AiGuidelineResult[] {
  let parsed: { results?: AiGuidelineResult[] };
  try {
    parsed = JSON.parse(extractJsonPayload(raw)) as {
      results?: AiGuidelineResult[];
    };
  } catch {
    throw new Error("記載ルールチェックの応答を JSON として解析できませんでした");
  }

  if (!Array.isArray(parsed.results)) {
    throw new Error("記載ルールチェックの応答に results がありません");
  }

  const allowedIds = new Set(AI_GUIDELINE_RULES.map((rule) => rule.id));
  const validJudgments = new Set<ComplianceJudgment>([
    "ok",
    "partial",
    "missing",
  ]);

  return parsed.results
    .filter((item) => allowedIds.has(item.ruleId))
    .map((item) => ({
      ruleId: item.ruleId,
      judgment: validJudgments.has(item.judgment) ? item.judgment : "partial",
      evidence: item.evidence.trim() || "判定根拠なし",
      nextAction: item.nextAction?.trim() || undefined,
    }));
}

function toComplianceItem(
  rule: GuidelineRule,
  result: AiGuidelineResult
): ComplianceItem {
  return {
    id: `gl-${rule.id}`,
    checklistItemId: rule.id,
    label: rule.label,
    judgment: result.judgment,
    evidence: result.evidence,
    nextAction: result.nextAction,
  };
}

function fallbackAiResults(message: string): ComplianceItem[] {
  return AI_GUIDELINE_RULES.map((rule) => ({
    id: `gl-${rule.id}`,
    checklistItemId: rule.id,
    label: rule.label,
    judgment: "partial" as const,
    evidence: message,
    nextAction: "ANTHROPIC_API_KEY を設定して再チェックしてください",
  }));
}

export async function runAiGuidelineChecks(
  draft: DraftSectionsContent
): Promise<ComplianceItem[]> {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    return fallbackAiResults("Claude API が未設定のため AI 判定をスキップしました");
  }

  const { system, user } = buildAiGuidelinePrompt(draft);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getClaudeModel(),
      max_tokens: 2048,
      system,
      messages: [{ role: "user", content: user }],
      output_config: {
        format: {
          type: "json_schema",
          schema: AI_GUIDELINE_JSON_SCHEMA,
        },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `記載ルール AI チェックが失敗しました（${response.status}）${detail ? `: ${detail.slice(0, 200)}` : ""}`
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
    throw new Error("記載ルール AI チェックから空の応答が返りました");
  }

  const parsed = parseAiGuidelineResponse(content);
  const byId = new Map(parsed.map((item) => [item.ruleId, item]));

  return AI_GUIDELINE_RULES.map((rule) => {
    const result = byId.get(rule.id);
    if (!result) {
      return toComplianceItem(rule, {
        ruleId: rule.id,
        judgment: "partial",
        evidence: "AI 判定結果が返りませんでした",
        nextAction: `${getDraftSectionText(draft, rule.section)} を見直してください`,
      });
    }
    return toComplianceItem(rule, result);
  });
}
