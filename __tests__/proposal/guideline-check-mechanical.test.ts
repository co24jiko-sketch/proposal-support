import { describe, expect, it } from "vitest";

import { runMechanicalGuidelineChecks } from "@/lib/proposal/guideline-check-mechanical";
import type { DraftSectionsContent } from "@/lib/proposal/types";

function draft(overrides: Partial<DraftSectionsContent> = {}): DraftSectionsContent {
  return {
    summary: "品質確保を軸に調査を実施する。",
    focusPoints: "（１）地質条件の把握\n（２）品質管理体制",
    detail: "手順（１）事前調査を実施する。",
    effects: "効果（１）調査精度を20%向上させる。",
    needsTechnicalReview: false,
    generatedAt: "2026-07-02T00:00:00.000Z",
    ...overrides,
  };
}

describe("guideline-check-mechanical", () => {
  it("禁止表現を検出する", () => {
    const items = runMechanicalGuidelineChecks(
      draft({ detail: "必要に応じて対応する。" })
    );
    const forbidden = items.find((item) => item.checklistItemId === "forbidden-phrases");
    expect(forbidden?.judgment).toBe("missing");
  });

  it("メールアドレスを特定情報として検出する", () => {
    const items = runMechanicalGuidelineChecks(
      draft({ summary: "連絡先は info@example.co.jp です。" })
    );
    const pii = items.find((item) => item.checklistItemId === "no-identifying-info");
    expect(pii?.judgment).toBe("missing");
  });

  it("A4 1枚目安を超えると partial または missing になる", () => {
    const longText = "あ".repeat(1500);
    const items = runMechanicalGuidelineChecks(
      draft({
        summary: longText,
        focusPoints: longText,
        detail: longText,
        effects: longText,
      })
    );
    const page = items.find((item) => item.checklistItemId === "a4-one-page");
    expect(page?.judgment).not.toBe("ok");
  });
});
