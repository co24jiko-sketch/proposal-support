import { describe, expect, it } from "vitest";

import { parseChecklistItemsFromText } from "@/lib/proposal/extract-checklist";

describe("parseChecklistItemsFromText", () => {
  it("番号付き行と配点列を採点項目として抽出する", () => {
    const text = `
評価の観点
1. 調査方針の明確性 10点
2. 調査方法の妥当性 15点
3. 品質管理体制（8点）
`;

    const items = parseChecklistItemsFromText(text);

    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items.some((item) => item.label.includes("調査方針"))).toBe(true);
    expect(items.some((item) => item.points === 15)).toBe(true);
  });

  it("採点項目らしい行がなければ空配列を返す", () => {
    expect(parseChecklistItemsFromText("入札仕様書\n目次")).toEqual([]);
  });

  it("配点表がなく評価セクションの記述から採点項目を推定する", () => {
    const text = `
第3章 技術提案書の提出
第4章 技術提案書の評価
評価の着眼点
ア 調査計画の妥当性について確認すること。
イ 品質管理体制の充実
ウ 安全管理の措置
`;

    const items = parseChecklistItemsFromText(text);

    expect(items.length).toBeGreaterThanOrEqual(3);
    expect(items.every((item) => item.confidence === "low")).toBe(true);
    expect(items.some((item) => item.label.includes("調査計画"))).toBe(true);
  });
});
