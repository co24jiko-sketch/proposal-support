import { describe, expect, it } from "vitest";

import { parseAiGuidelineResponse } from "@/lib/proposal/guideline-check-ai";

describe("guideline-check-ai", () => {
  it("AI 応答 JSON をパースする", () => {
    const results = parseAiGuidelineResponse(
      JSON.stringify({
        results: [
          {
            ruleId: "summary-concise",
            judgment: "ok",
            evidence: "簡潔です",
          },
        ],
      })
    );
    expect(results[0]?.ruleId).toBe("summary-concise");
    expect(results[0]?.judgment).toBe("ok");
  });
});
