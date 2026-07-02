import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  getClaudeModel,
  getLlmProvider,
  isLlmConfigured,
} from "@/lib/proposal/llm-config";

describe("llm-config", () => {
  const originalAnthropic = process.env.ANTHROPIC_API_KEY;
  const originalOpenAi = process.env.OPENAI_API_KEY;
  const originalStub = process.env.PROPOSAL_AI_STUB;
  const originalClaudeModel = process.env.CLAUDE_MODEL;

  beforeEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.PROPOSAL_AI_STUB;
    delete process.env.CLAUDE_MODEL;
  });

  afterEach(() => {
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
    if (originalStub === undefined) {
      delete process.env.PROPOSAL_AI_STUB;
    } else {
      process.env.PROPOSAL_AI_STUB = originalStub;
    }
    if (originalClaudeModel === undefined) {
      delete process.env.CLAUDE_MODEL;
    } else {
      process.env.CLAUDE_MODEL = originalClaudeModel;
    }
  });

  it("Anthropic キーがあるときは Claude を優先する", () => {
    process.env.ANTHROPIC_API_KEY = "anthropic-key";
    process.env.OPENAI_API_KEY = "openai-key";

    expect(getLlmProvider()).toBe("anthropic");
    expect(isLlmConfigured()).toBe(true);
  });

  it("Anthropic キーが無いときは OpenAI にフォールバックする", () => {
    process.env.OPENAI_API_KEY = "openai-key";

    expect(getLlmProvider()).toBe("openai");
    expect(isLlmConfigured()).toBe(true);
  });

  it("スタブモードでも LLM 設定済みとみなす", () => {
    process.env.PROPOSAL_AI_STUB = "true";
    expect(isLlmConfigured()).toBe(true);
    expect(getLlmProvider()).toBeNull();
  });

  it("Claude モデルのデフォルトは Sonnet", () => {
    expect(getClaudeModel()).toBe("claude-sonnet-4-20250514");
  });
});
