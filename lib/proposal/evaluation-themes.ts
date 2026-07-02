/** 技術提案書の評価テーマ（入札ごとに1つ。文案全体の論調を決める） */
export const EVALUATION_THEMES = [
  { id: "quality", label: "品質確保" },
  { id: "schedule", label: "工期短縮" },
  { id: "cost", label: "コスト削減" },
  { id: "safety", label: "安全管理" },
  { id: "environment", label: "環境配慮" },
] as const;

export type EvaluationThemeId = (typeof EVALUATION_THEMES)[number]["id"];

export function getEvaluationThemeLabel(id: string): string | undefined {
  return EVALUATION_THEMES.find((theme) => theme.id === id)?.label;
}

export function isEvaluationThemeId(id: string): id is EvaluationThemeId {
  return EVALUATION_THEMES.some((theme) => theme.id === id);
}
