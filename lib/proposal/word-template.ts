import { readFileSync } from "node:fs";
import { join } from "node:path";

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";

import { buildForm10TemplateData } from "@/lib/proposal/form10-template-data";
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

export function fillForm10Template(caseItem: ProposalCase): Buffer {
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

export function isForm10TemplateAvailable(): boolean {
  try {
    getTemplateBytes();
    return true;
  } catch {
    return false;
  }
}
