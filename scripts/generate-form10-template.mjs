/**
 * 様式－１０用 Word テンプレート（docxtemplater プレースホルダー付き）を生成する。
 * 会社様式 docx に差し替える場合も、同じ {{...}} 名をコンテンツコントロール等に置く。
 *
 * 実行: node scripts/generate-form10-template.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "lib", "proposal", "templates");
const outPath = join(outDir, "form-10-v1.docx");

function placeholder(name) {
  return new Paragraph({
    children: [new TextRun(`{{${name}}}`)],
  });
}

function labeledPlaceholder(label, name) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true }),
      new TextRun(`{{${name}}}`),
    ],
  });
}

const doc = new Document({
  sections: [
    {
      children: [
        new Paragraph({
          text: "技術提案書（様式－１０）",
          heading: HeadingLevel.TITLE,
        }),
        labeledPlaceholder("業務件名", "projectName"),
        labeledPlaceholder("発注者", "client"),
        labeledPlaceholder("場所", "location"),
        labeledPlaceholder("工期", "schedule"),
        labeledPlaceholder("評価テーマ", "evaluationTheme"),
        labeledPlaceholder("提案の軸", "proposalAxis"),
        labeledPlaceholder("版", "version"),
        new Paragraph({ text: "" }),
        new Paragraph({
          text: "１）提案の概要",
          heading: HeadingLevel.HEADING_1,
        }),
        placeholder("summary"),
        new Paragraph({
          text: "① 着目点",
          heading: HeadingLevel.HEADING_1,
        }),
        placeholder("focusPoints"),
        new Paragraph({
          text: "② 詳細な内容",
          heading: HeadingLevel.HEADING_1,
        }),
        placeholder("detail"),
        new Paragraph({
          text: "③ 効果",
          heading: HeadingLevel.HEADING_1,
        }),
        placeholder("effects"),
        placeholder("technicalReviewNote"),
      ],
    },
  ],
});

mkdirSync(outDir, { recursive: true });
const buffer = await Packer.toBuffer(doc);
writeFileSync(outPath, buffer);
console.log(`Wrote ${outPath} (${buffer.byteLength} bytes)`);
