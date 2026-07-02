const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

export function isAiStubMode(): boolean {
  return process.env.PROPOSAL_AI_STUB === "true";
}

export function getOpenAiApiKey(): string | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key || null;
}

export function getOpenAiModel(): string {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
}

export function isLlmConfigured(): boolean {
  return isAiStubMode() || Boolean(getOpenAiApiKey());
}

export function assertLlmConfigured(): void {
  if (!isLlmConfigured()) {
    throw new Error(
      "OPENAI_API_KEY が未設定です。Vercel の Environment Variables または .env.local に設定してください（ローカル検証のみの場合は PROPOSAL_AI_STUB=true も可）"
    );
  }
}
