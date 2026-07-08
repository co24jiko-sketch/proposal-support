import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "docs", "proposal-overview-screenshots");
const baseUrl = process.env.PROPOSAL_URL ?? "https://proposal-support.vercel.app";
const email = process.env.PROPOSAL_EMAIL ?? "manager@pilot.local";
const password = process.env.PROPOSAL_PASSWORD ?? "PilotManager2026";

const DEMO_PROJECT_NAMES = [
  "○○地区地質調査業務",
  "△△トンネル地質調査業務",
  "□□盛土調査業務",
];

/** 図解用に件名・発注者・担当者・入札図書名を匿名化 */
async function anonymizeForScreenshot(page) {
  await page.evaluate((projectNames) => {
    const client = "国土交通省 ○○地方整備局";
    const assignee = "担当 太郎";

    document.querySelectorAll("table tbody tr").forEach((row, index) => {
      const nameCell = row.querySelector("td.font-medium");
      if (!nameCell) return;
      const lines = nameCell.querySelectorAll("p");
      if (lines[0]) {
        lines[0].textContent =
          projectNames[index % projectNames.length] ?? "○○調査業務";
      }
      if (lines[1]) lines[1].textContent = client;
      const assigneeCell = row.children[2];
      if (assigneeCell) assigneeCell.textContent = assignee;
    });

    for (const h1 of document.querySelectorAll("h1.text-2xl")) {
      if (h1.textContent?.includes("案件一覧")) continue;
      h1.textContent = projectNames[0];
    }

    for (const el of document.querySelectorAll("p.text-sm.text-muted-foreground")) {
      const text = el.textContent ?? "";
      if (text.startsWith("主担当:")) {
        el.textContent = `主担当: ${assignee} / 発注者: ${client}`;
      }
    }

    for (const el of document.querySelectorAll("p, span, div")) {
      const text = el.textContent ?? "";
      if (text.includes("アップロード済み:") && el.children.length === 0) {
        el.textContent = "アップロード済み: 入札図書（サンプル）.pdf";
      }
    }
  }, DEMO_PROJECT_NAMES);
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

async function shot(name, { anonymize = true } = {}) {
  if (anonymize) {
    await page.waitForLoadState("domcontentloaded");
    await anonymizeForScreenshot(page);
    await page.waitForTimeout(300);
  }
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log("saved", file);
}

try {
  await page.goto(`${baseUrl}/proposal/login`, { waitUntil: "networkidle" });
  await shot("01-login", { anonymize: false });

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await Promise.all([
    page.waitForURL("**/proposal", { timeout: 30000 }),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForFunction(
    () => !document.body.textContent?.includes("案件を読み込み中"),
    { timeout: 30000 }
  );
  await page.waitForTimeout(800);
  await shot("02-case-list");

  const casesResponse = await page.request.get(`${baseUrl}/api/proposal/cases`);
  let caseHref = null;
  if (casesResponse.ok()) {
    const cases = await casesResponse.json();
    const first = Array.isArray(cases) ? cases[0] : cases?.cases?.[0];
    if (first?.id) {
      caseHref = `${baseUrl}/proposal/cases/${first.id}?tab=checklist`;
    }
  }

  if (caseHref) {
    await page.goto(caseHref, { waitUntil: "networkidle" });
  } else {
    await page.goto(`${baseUrl}/proposal/cases/case-1?tab=checklist`, {
      waitUntil: "networkidle",
    });
  }

  await page.waitForTimeout(1500);

  if (page.url().includes("/cases/")) {
    await shot("03-case-detail");

    const checklistTab = page.getByRole("tab", { name: /チェックリスト/ });
    if ((await checklistTab.count()) > 0) {
      await checklistTab.click();
      await page.waitForTimeout(800);
      await shot("04-checklist");
    }

    const draftTab = page.getByRole("tab", { name: /文案/ });
    if ((await draftTab.count()) > 0) {
      await draftTab.click();
      await page.waitForTimeout(800);
      await shot("05-draft");
    }

    const complianceTab = page.getByRole("tab", { name: /記載ルール/ });
    if ((await complianceTab.count()) > 0) {
      await complianceTab.click();
      await page.waitForTimeout(800);
      await shot("06-compliance");
    }

    const approvalTab = page.getByRole("tab", { name: /承認/ });
    if ((await approvalTab.count()) > 0) {
      await approvalTab.click();
      await page.waitForTimeout(800);
      await shot("07-approval");
    }
  }
} finally {
  await browser.close();
}
