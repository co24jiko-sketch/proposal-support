import { readFileSync } from "node:fs";
import { join } from "node:path";

import PizZip from "pizzip";

import { buildForm10TemplateData } from "@/lib/proposal/form10-template-data";
import type { ProposalCase } from "@/lib/proposal/types";

export const OFFICIAL_SOURCE_FILENAME = "form-10-official-source.docx";

const SOURCE_PATH = join(
  process.cwd(),
  "lib",
  "proposal",
  "templates",
  OFFICIAL_SOURCE_FILENAME
);

const SECTIONS = [
  { label: "１）提案の概要", key: "summary" as const },
  { label: "①提案に関する着目点", key: "focusPoints" as const },
  { label: "②提案に関する詳細な内容", key: "detail" as const },
  {
    label: "③提案内容を実施したことによる効果",
    key: "effects" as const,
  },
];

const EMPTY_PARAGRAPH =
  /<w:p[^>]*><w:pPr>[\s\S]*?<\/w:pPr><\/w:p>/;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textToParagraphsXml(text: string): string {
  const lines = text.split(/\n/);
  return lines
    .map(
      (line) =>
        `<w:p><w:pPr><w:rPr><w:rFonts w:hint="default"/><w:szCs w:val="21"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:hint="default"/><w:szCs w:val="21"/></w:rPr><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`
    )
    .join("");
}

function injectAfterLabel(
  xml: string,
  label: string,
  text: string
): string {
  const labelIndex = xml.indexOf(label);
  if (labelIndex === -1) {
    throw new Error(`様式内に見出しが見つかりません: ${label}`);
  }

  const tail = xml.slice(labelIndex);
  const match = tail.match(EMPTY_PARAGRAPH);
  if (!match) {
    throw new Error(`記入欄の空段落が見つかりません: ${label}`);
  }

  return (
    xml.slice(0, labelIndex) +
    tail.replace(match[0], textToParagraphsXml(text))
  );
}

export function isOfficialForm10SourceAvailable(): boolean {
  try {
    readFileSync(SOURCE_PATH);
    return true;
  } catch {
    return false;
  }
}

export function fillOfficialForm10Template(caseItem: ProposalCase): Buffer {
  const data = buildForm10TemplateData(caseItem);
  const zip = new PizZip(readFileSync(SOURCE_PATH));
  let documentXml = zip.file("word/document.xml")?.asText();

  if (!documentXml) {
    throw new Error("様式－１０の document.xml が読み込めません");
  }

  for (const section of SECTIONS) {
    documentXml = injectAfterLabel(
      documentXml,
      section.label,
      data[section.key]
    );
  }

  zip.file("word/document.xml", documentXml);

  return zip.generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  }) as Buffer;
}
