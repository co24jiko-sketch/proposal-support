import { readFileSync } from "node:fs";
import { join } from "node:path";

import fontkit from "@pdf-lib/fontkit";
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { PDFDocument, type PDFFont, rgb } from "pdf-lib";

import type { ProposalCase } from "@/lib/proposal/types";

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const PAGE_MARGIN = 50;

let cachedJapaneseFontBytes: Uint8Array | null = null;

const JAPANESE_FONT_RELATIVE_PATH = join(
  "node_modules",
  "@fontpkg",
  "ip-aex-gothic",
  "IPAexGothic.ttf"
);

function getJapaneseFontBytes(): Uint8Array {
  if (!cachedJapaneseFontBytes) {
    try {
      cachedJapaneseFontBytes = readFileSync(
        join(process.cwd(), JAPANESE_FONT_RELATIVE_PATH)
      );
    } catch (error) {
      const detail = error instanceof Error ? error.message : "unknown";
      throw new Error(`日本語フォントの読み込みに失敗しました: ${detail}`);
    }
  }

  return cachedJapaneseFontBytes;
}

function labeledParagraph(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true }),
      new TextRun(value.trim() || "（未入力）"),
    ],
  });
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
  });
}

function bodyParagraph(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun(text.trim() || "（未入力）")],
  });
}

function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  let current = "";

  for (const char of text) {
    if (char === "\n") {
      if (current) lines.push(current);
      current = "";
      continue;
    }

    const candidate = current + char;
    if (font.widthOfTextAtSize(candidate, fontSize) > maxWidth && current) {
      lines.push(current);
      current = char;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines.length > 0 ? lines : ["（未入力）"];
}

/** 案件データから Word (.docx) バイナリを生成 */
export async function buildWordDocxBuffer(caseItem: ProposalCase): Promise<Buffer> {
  const { basicInput } = caseItem;
  const versionLabel = caseItem.currentWordVersion ?? "v1";

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: "技術提案書",
            heading: HeadingLevel.TITLE,
          }),
          labeledParagraph("案件名", basicInput.projectName),
          labeledParagraph("発注者", basicInput.client),
          labeledParagraph("場所", basicInput.location),
          labeledParagraph("工期", basicInput.schedule),
          labeledParagraph("版", versionLabel),
          sectionHeading("１）提案の概要"),
          bodyParagraph(basicInput.surveyPurpose),
          sectionHeading("② 詳細な内容"),
          bodyParagraph(basicInput.surveyPlanOutline),
          sectionHeading("既知の地質情報"),
          bodyParagraph(basicInput.siteKnownInfo),
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

/** 案件データから提出版 PDF バイナリを生成 */
export async function buildSubmissionPdfBuffer(
  caseItem: ProposalCase
): Promise<Buffer> {
  const { basicInput } = caseItem;
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const font = await pdfDoc.embedFont(getJapaneseFontBytes());
  let page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);

  const maxWidth = page.getWidth() - PAGE_MARGIN * 2;
  let y = page.getHeight() - PAGE_MARGIN;
  const bodySize = 11;
  const headingSize = 14;
  const titleSize = 20;
  const bodyLineHeight = 18;
  const headingLineHeight = 24;
  const titleLineHeight = 32;

  function ensureSpace(needed: number): void {
    if (y - needed >= PAGE_MARGIN) return;

    page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
    y = page.getHeight() - PAGE_MARGIN;
  }

  function drawLine(text: string, size: number, lineHeight: number): void {
    ensureSpace(lineHeight);
    page.drawText(text, {
      x: PAGE_MARGIN,
      y: y - size,
      size,
      font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;
  }

  function drawWrapped(text: string, size = bodySize): void {
    for (const line of wrapText(text.trim() || "（未入力）", font, size, maxWidth)) {
      drawLine(line, size, bodyLineHeight);
    }
    y -= 6;
  }

  function drawHeading(text: string): void {
    y -= 4;
    drawLine(text, headingSize, headingLineHeight);
  }

  function drawLabelValue(label: string, value: string): void {
    drawWrapped(`${label}: ${value.trim() || "（未入力）"}`, bodySize);
  }

  drawLine("技術提案書（提出版）", titleSize, titleLineHeight);
  y -= 8;

  drawLabelValue("案件名", basicInput.projectName);
  drawLabelValue("発注者", basicInput.client);
  drawLabelValue("場所", basicInput.location);
  drawLabelValue("工期", basicInput.schedule);

  if (caseItem.managerApproval) {
    drawLabelValue("部長承認", caseItem.managerApproval.approverName);
  }
  if (caseItem.directorApproval) {
    drawLabelValue("支社長承認", caseItem.directorApproval.approverName);
  }

  drawHeading("１）提案の概要");
  drawWrapped(basicInput.surveyPurpose);

  drawHeading("② 詳細な内容");
  drawWrapped(basicInput.surveyPlanOutline);

  drawHeading("既知の地質情報");
  drawWrapped(basicInput.siteKnownInfo);

  return Buffer.from(await pdfDoc.save());
}
