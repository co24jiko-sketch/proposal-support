import { describe, expect, it } from "vitest";

import {
  buildSearchTerms,
  generateComplianceItems,
  judgeChecklistCoverage,
} from "@/lib/proposal/compliance-check";

describe("compliance-check", () => {
  const sampleDocument = `
    技術提案書
    １）提案の概要
    本事業の調査方針と概要を示す。
    ② 詳細な内容
    調査方法と実施計画の詳細を記載する。
  `;

  it("文案に関連語がある採点項目は適合と判定する", () => {
    const result = judgeChecklistCoverage(
      "調査方針の明確性",
      sampleDocument,
      ["概要", "提案", "調査", "方針"]
    );

    expect(result.judgment).toBe("ok");
    expect(result.matchedTerms.length).toBeGreaterThan(0);
  });

  it("文案に記述がない採点項目は不適合と判定する", () => {
    const result = judgeChecklistCoverage(
      "品質管理体制",
      sampleDocument,
      ["品質", "管理", "体制"]
    );

    expect(result.judgment).toBe("missing");
  });

  it("採点項目リストから適合チェック結果を生成する", () => {
    const items = generateComplianceItems(
      [
        {
          id: "cl-1",
          label: "調査方針の明確性",
          points: 10,
          confidence: "high",
          searchKeywords: ["概要", "提案", "調査", "方針"],
        },
        {
          id: "cl-2",
          label: "品質管理体制",
          points: 10,
          confidence: "high",
          searchKeywords: ["品質", "管理", "体制"],
        },
      ],
      sampleDocument
    );

    expect(items).toHaveLength(2);
    expect(items[0]?.judgment).toBe("ok");
    expect(items[1]?.judgment).toBe("missing");
  });

  it("採点項目0件のときはスキップ扱いの1件を返す", () => {
    const items = generateComplianceItems([], sampleDocument);
    expect(items).toHaveLength(1);
    expect(items[0]?.judgment).toBe("ok");
    expect(items[0]?.label).toContain("採点項目なし");
  });

  it("searchKeywords 未指定時はラベルから検索語を組み立てる", () => {
    const terms = buildSearchTerms("調査方法の妥当性");
    expect(terms).toContain("調査方法");
  });
});
