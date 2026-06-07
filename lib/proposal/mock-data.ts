import type { LibraryItem, ProposalCase, WorkflowStepId } from "@/lib/proposal/types";

export const mockLibraryItems: LibraryItem[] = [
  {
    id: "lib-1",
    title: "○○地区地質調査 技術提案（良例）",
    branch: "東京支社",
    formType: "様式－１０",
    region: "関東（国交省関東地方整備局）",
    businessType: "地質調査業務",
    uploadedBy: "鈴木 一郎",
    uploadedAt: "2026-04-01",
    archived: false,
  },
  {
    id: "lib-2",
    title: "△△トンネル調査 提案書",
    branch: "大阪支社",
    formType: "様式－１０",
    region: "近畿（国交省近畿地方整備局）",
    businessType: "地質調査業務",
    uploadedBy: "田中 花子",
    uploadedAt: "2026-03-15",
    archived: false,
  },
];

export const mockCases: ProposalCase[] = [
  {
    id: "case-1",
    projectName: "○○地区地質調査業務",
    client: "国土交通省関東地方整備局",
    assigneeName: "山田 太郎",
    assigneeId: "user-yamada",
    status: "editing",
    formType: "様式－１０",
    updatedAt: "2026-05-20",
    basicInput: {
      projectName: "○○地区地質調査業務",
      client: "国土交通省関東地方整備局",
      location: "東京都○○区",
      schedule: "2026年7月〜9月（予定）",
      surveyPurpose:
        "計画道路の設計に必要な地質条件を明らかにし、軟弱地盤の分布と支持層深度を把握する。",
      siteKnownInfo:
        "平坦な埋立地と旧河道跡が想定される。既往のボーリング調査（平成20年）あり。",
      surveyPlanOutline:
        "SB-1本（深度30m）、標準貫入試験、室内試験（粒度・含水比）。必要に応じて追加ボーリング。",
    },
    checklistConfirmed: true,
    checklistItems: [
      {
        id: "cl-1",
        label: "調査方針の明確性",
        points: 10,
        confidence: "high",
      },
      {
        id: "cl-2",
        label: "調査方法の妥当性",
        points: 15,
        confidence: "low",
      },
      {
        id: "cl-3",
        label: "品質管理体制",
        points: 10,
        confidence: "high",
      },
      {
        id: "cl-4",
        label: "安全管理",
        points: 8,
        confidence: "low",
      },
    ],
    complianceItems: [
      {
        id: "cp-1",
        checklistItemId: "cl-1",
        label: "調査方針の明確性",
        judgment: "ok",
        evidence: "概要 — 調査目的と範囲を記載",
      },
      {
        id: "cp-2",
        checklistItemId: "cl-2",
        label: "調査方法の妥当性",
        judgment: "partial",
        evidence: "詳細 — ボーリング計画の記載あり",
        nextAction: "深度設定の根拠を追記",
      },
      {
        id: "cp-3",
        checklistItemId: "cl-3",
        label: "品質管理体制",
        judgment: "ok",
        evidence: "詳細 — 品質管理フローを記載",
      },
      {
        id: "cp-4",
        checklistItemId: "cl-4",
        label: "安全管理",
        judgment: "missing",
        evidence: "該当記述なし",
        nextAction: "安全管理体制の記述を追加",
      },
    ],
    managerApproval: null,
    directorApproval: null,
    versions: [
      {
        id: "v1",
        label: "v1",
        createdAt: "2026-05-18 10:00",
        action: "初稿生成",
      },
      {
        id: "v2",
        label: "v2",
        createdAt: "2026-05-19 15:30",
        action: "Word手修正",
      },
      {
        id: "v3",
        label: "v3",
        createdAt: "2026-05-20 14:00",
        action: "Word再取込",
      },
    ],
    auditLog: [
      {
        id: "log-1",
        at: "2026-05-18 10:00",
        user: "山田 太郎",
        action: "初稿生成",
      },
      {
        id: "log-2",
        at: "2026-05-20 14:00",
        user: "山田 太郎",
        action: "Word再取込",
        detail: "適合チェック v3",
      },
    ],
    referencedLibraryIds: ["lib-1"],
    bidDocumentName: "入札図書_kyoushi.pdf",
    currentWordVersion: "v3",
    generatedSections: {
      summary: true,
      focusPoints: true,
      detail: true,
      effects: false,
    },
  },
  {
    id: "case-2",
    projectName: "△△トンネル地質調査",
    client: "国土交通省近畿地方整備局",
    assigneeName: "佐藤 次郎",
    assigneeId: "user-sato",
    status: "pending_manager",
    formType: "様式－１０",
    updatedAt: "2026-05-18",
    basicInput: {
      projectName: "△△トンネル地質調査",
      client: "国土交通省近畿地方整備局",
      location: "大阪府○○市",
      schedule: "2026年8月〜11月",
      surveyPurpose: "トンネル設計に必要な地質・地下水条件の把握",
      siteKnownInfo: "花崗岩系岩盤が想定。涌水リスクあり。",
      surveyPlanOutline: "SB-3本、深度50m、透水試験実施",
    },
    checklistConfirmed: true,
    checklistItems: [
      {
        id: "cl-5",
        label: "調査方針の明確性",
        points: 10,
        confidence: "high",
      },
    ],
    complianceItems: [
      {
        id: "cp-5",
        checklistItemId: "cl-5",
        label: "調査方針の明確性",
        judgment: "ok",
        evidence: "概要 — 目的を明記",
      },
    ],
    managerApproval: null,
    directorApproval: null,
    approvalRequestReason: "図面参照で安全管理はカバー予定",
    versions: [],
    auditLog: [
      {
        id: "log-3",
        at: "2026-05-18 09:00",
        user: "佐藤 次郎",
        action: "承認申請",
      },
    ],
    referencedLibraryIds: [],
    bidDocumentName: "入札図書_tunnel.pdf",
    currentWordVersion: "v2",
    generatedSections: {
      summary: true,
      focusPoints: true,
      detail: true,
      effects: true,
    },
  },
  {
    id: "case-3",
    projectName: "□□盛土調査",
    client: "国土交通省九州地方整備局",
    assigneeName: "山田 太郎",
    assigneeId: "user-yamada",
    status: "approved",
    formType: "様式－１０",
    updatedAt: "2026-05-10",
    basicInput: {
      projectName: "□□盛土調査",
      client: "国土交通省九州地方整備局",
      location: "福岡県○○町",
      schedule: "2026年6月",
      surveyPurpose: "盛土材料の適性評価",
      siteKnownInfo: "火山灰土が広域分布",
      surveyPlanOutline: "試掘3箇所、簡易試験",
    },
    checklistConfirmed: true,
    checklistItems: [],
    complianceItems: [],
    managerApproval: {
      approvedAt: "2026-05-09",
      approverName: "部長 高橋",
    },
    directorApproval: {
      approvedAt: "2026-05-10",
      approverName: "支社長 伊藤",
    },
    versions: [],
    auditLog: [],
    referencedLibraryIds: [],
    generatedSections: {
      summary: true,
      focusPoints: true,
      detail: true,
      effects: true,
    },
  },
];

export function getCaseById(id: string): ProposalCase | undefined {
  return mockCases.find((item) => item.id === id);
}

export function getComplianceSummary(caseItem: ProposalCase) {
  return caseItem.complianceItems.reduce(
    (acc, item) => {
      if (item.judgment === "ok") acc.ok += 1;
      if (item.judgment === "partial") acc.partial += 1;
      if (item.judgment === "missing") acc.missing += 1;
      return acc;
    },
    { ok: 0, partial: 0, missing: 0 }
  );
}

export function getWorkflowStep(caseItem: ProposalCase): WorkflowStepId {
  switch (caseItem.status) {
    case "draft":
      return "basic_input";
    case "checklist_pending":
      return "checklist";
    case "ready_to_generate":
      return "generate";
    case "editing":
    case "returned":
      return "reimport";
    case "pending_manager":
    case "pending_director":
      return "approval_request";
    case "approved":
      return "pdf_export";
    default:
      return "basic_input";
  }
}
