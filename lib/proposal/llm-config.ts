const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-20250514";

export type LlmProvider = "anthropic" | "openai";

export function isAiStubMode(): boolean {
  return process.env.PROPOSAL_AI_STUB === "true";
}

export function getAnthropicApiKey(): string | null {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  return key || null;
}

export function getOpenAiApiKey(): string | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key || null;
}

export function getClaudeModel(): string {
  return process.env.CLAUDE_MODEL?.trim() || DEFAULT_CLAUDE_MODEL;
}

export function getOpenAiModel(): string {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
}

/** Claude を優先し、Anthropic キーが無いときだけ OpenAI にフォールバック */
export function getLlmProvider(): LlmProvider | null {
  if (getAnthropicApiKey()) return "anthropic";
  if (getOpenAiApiKey()) return "openai";
  return null;
}

export function isLlmConfigured(): boolean {
  return isAiStubMode() || getLlmProvider() !== null;
}

export function assertLlmConfigured(): void {
  if (!isLlmConfigured()) {
    throw new Error(
      "LLM API キーが未設定です。Vercel の Environment Variables または .env.local に ANTHROPIC_API_KEY（推奨）または OPENAI_API_KEY を設定してください（ローカル検証のみの場合は PROPOSAL_AI_STUB=true も可）"
    );
  }
}
