import { readFileSync } from "node:fs";
import { join } from "node:path";

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";

import { buildForm10TemplateData } from "@/lib/proposal/form10-template-data";
import {
  fillOfficialForm10Template,
  isOfficialForm10SourceAvailable,
  OFFICIAL_SOURCE_FILENAME,
} from "@/lib/proposal/official-form10-fill";
import type { ProposalCase } from "@/lib/proposal/types";

export const FORM10_TEMPLATE_FILENAME = "form-10-v1.docx";

const TEMPLATE_PATH = join(
  process.cwd(),
  "lib",
  "proposal",
  "templates",
  FORM10_TEMPLATE_FILENAME
);

let cachedTemplateBytes: Buffer | null = null;

function getTemplateBytes(): Buffer {
  if (!cachedTemplateBytes) {
    try {
      cachedTemplateBytes = readFileSync(TEMPLATE_PATH);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "unknown";
      throw new Error(
        `様式－１０テンプレートが見つかりません (${TEMPLATE_PATH}): ${detail}`
      );
    }
  }
  return cachedTemplateBytes;
}

function fillDocxTemplate(caseItem: ProposalCase): Buffer {
  const zip = new PizZip(getTemplateBytes());
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render(buildForm10TemplateData(caseItem));

  return doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  }) as Buffer;
}

export function fillForm10Template(caseItem: ProposalCase): Buffer {
  if (isOfficialForm10SourceAvailable()) {
    return fillOfficialForm10Template(caseItem);
  }

  // 正式様式が無い環境のみ簡易テンプレートへフォールバック（ローカル開発用）
  if (isDocxTemplateAvailable()) {
    return fillDocxTemplate(caseItem);
  }

  throw new Error(
    `様式－１０テンプレートが見つかりません（${OFFICIAL_SOURCE_FILENAME} または ${FORM10_TEMPLATE_FILENAME}）。Vercel では outputFileTracingIncludes の設定を確認してください。`
  );
}

export function isForm10TemplateAvailable(): boolean {
  return isOfficialForm10SourceAvailable() || isDocxTemplateAvailable();
}

function isDocxTemplateAvailable(): boolean {
  try {
    getTemplateBytes();
    return true;
  } catch {
    return false;
  }
}
