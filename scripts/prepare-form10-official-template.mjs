/**
 * 高山資料の技術提案書様式.docx に docxtemplater 用プレースホルダーを挿入する。
 *
 * 入力: lib/proposal/templates/form-10-official-source.docx
 * 出力: lib/proposal/templates/form-10-official.docx
 *
 * 実行: node scripts/prepare-form10-official-template.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import PizZip from "pizzip";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesDir = join(__dirname, "..", "lib", "proposal", "templates");
const sourcePath = join(templatesDir, "form-10-official-source.docx");
const outputPath = join(templatesDir, "form-10-official.docx");

const PLACEHOLDERS = [
  { label: "１）提案の概要", tag: "{{summary}}" },
  { label: "①提案に関する着目点", tag: "{{focusPoints}}" },
  { label: "②提案に関する詳細な内容", tag: "{{detail}}" },
  {
    label: "③提案内容を実施したことによる効果",
    tag: "{{effects}}",
  },
];

const EMPTY_PARAGRAPH =
  /<w:p[^>]*><w:pPr>[\s\S]*?<\/w:pPr><\/w:p>/;

function injectPlaceholder(xml, label, tag) {
  const labelIndex = xml.indexOf(label);
  if (labelIndex === -1) {
    throw new Error(`様式内に見出しが見つかりません: ${label}`);
  }

  const tail = xml.slice(labelIndex);
  const match = tail.match(EMPTY_PARAGRAPH);
  if (!match) {
    throw new Error(`記入欄の空段落が見つかりません: ${label}`);
  }

  const filled = match[0].replace(
    "</w:pPr></w:p>",
    `</w:pPr><w:r><w:rPr><w:rFonts w:hint="default"/><w:szCs w:val="21"/></w:rPr><w:t xml:space="preserve">${tag}</w:t></w:r></w:p>`
  );

  return (
    xml.slice(0, labelIndex) + tail.replace(match[0], filled)
  );
}

const zip = new PizZip(readFileSync(sourcePath));
let documentXml = zip.file("word/document.xml").asText();

for (const item of PLACEHOLDERS) {
  documentXml = injectPlaceholder(documentXml, item.label, item.tag);
}

zip.file("word/document.xml", documentXml);
const output = zip.generate({
  type: "nodebuffer",
  compression: "DEFLATE",
});

writeFileSync(outputPath, output);
console.log(`Wrote ${outputPath} (${output.byteLength} bytes)`);
