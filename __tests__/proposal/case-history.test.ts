import { describe, expect, it } from "vitest";

import { formatHistoryTimestamp } from "@/lib/proposal/case-history";

describe("formatHistoryTimestamp", () => {
  it("UTC を日本時間（JST）で表示する", () => {
    expect(formatHistoryTimestamp("2026-06-20T13:26:00.000Z")).toBe(
      "2026-06-20 22:26"
    );
  });
});
