"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { mockLibraryItems } from "@/lib/proposal/mock-data";
import { EVALUATION_THEMES } from "@/lib/proposal/evaluation-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type FormState = {
  projectName: string;
  client: string;
  location: string;
  schedule: string;
  surveyPurpose: string;
  siteKnownInfo: string;
  surveyPlanOutline: string;
  evaluationTheme: string;
  proposalAxisDraft: string;
  pastPerformanceNotes: string;
  relatedWorkNotes: string;
};

const emptyForm: FormState = {
  projectName: "",
  client: "",
  location: "",
  schedule: "",
  surveyPurpose: "",
  siteKnownInfo: "",
  surveyPlanOutline: "",
  evaluationTheme: "",
  proposalAxisDraft: "",
  pastPerformanceNotes: "",
  relatedWorkNotes: "",
};

export function NewCaseWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedLibrary, setSelectedLibrary] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateStep1(): boolean {
    const required: (keyof FormState)[] = [
      "projectName",
      "client",
      "location",
      "surveyPurpose",
      "siteKnownInfo",
      "surveyPlanOutline",
    ];
    const missing = required.filter((key) => !form[key].trim());
    if (missing.length > 0) {
      setError("必須項目を入力してください");
      return false;
    }
    if (!form.evaluationTheme) {
      setError("評価テーマを選択してください");
      return false;
    }
    setError(null);
    return true;
  }

  async function handleCreate() {
    if (!validateStep1()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/proposal/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "案件の作成に失敗しました");
      }

      router.push(`/proposal/cases/${data.id}?tab=checklist`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "案件の作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-w-[1280px] max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">新規案件</h1>
        <p className="text-sm text-muted-foreground">
          Step {step} / 2 — {step === 1 ? "基本情報" : "資料・事例"}
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>必須4項目</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="projectName">工事名 *</Label>
                <Input
                  id="projectName"
                  placeholder="○○地区地質調査業務"
                  value={form.projectName}
                  onChange={(e) => updateField("projectName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">発注者 *</Label>
                <Input
                  id="client"
                  placeholder="国土交通省○○地方整備局"
                  value={form.client}
                  onChange={(e) => updateField("client", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">場所 *</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule">工期目安</Label>
                <Input
                  id="schedule"
                  value={form.schedule}
                  onChange={(e) => updateField("schedule", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">調査目的・範囲 *</Label>
              <Textarea
                id="purpose"
                rows={3}
                value={form.surveyPurpose}
                onChange={(e) => updateField("surveyPurpose", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="known">対象地の既知情報 *</Label>
              <Textarea
                id="known"
                rows={3}
                value={form.siteKnownInfo}
                onChange={(e) => updateField("siteKnownInfo", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="plan">調査計画の骨子 *</Label>
              <Textarea
                id="plan"
                rows={3}
                value={form.surveyPlanOutline}
                onChange={(e) => updateField("surveyPlanOutline", e.target.value)}
              />
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium">文案生成用</p>
              <p className="text-sm text-muted-foreground">
                評価テーマは必須です。提案の軸は入札検討のたたき台（仮）として入力できます。
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="evaluationTheme">評価テーマ *</Label>
              <Select
                value={form.evaluationTheme || undefined}
                onValueChange={(value) => updateField("evaluationTheme", value ?? "")}
              >
                <SelectTrigger id="evaluationTheme" className="w-full">
                  <SelectValue placeholder="評価テーマを選択" />
                </SelectTrigger>
                <SelectContent>
                  {EVALUATION_THEMES.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      {theme.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="proposalAxisDraft">提案の軸（仮）</Label>
              <Textarea
                id="proposalAxisDraft"
                rows={2}
                placeholder="例: 地質リスクの網羅的抽出と、後続業務への円滑な引継ぎ"
                value={form.proposalAxisDraft}
                onChange={(e) => updateField("proposalAxisDraft", e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-between border-t">
            <Button variant="outline" render={<Link href="/proposal" />}>
              キャンセル
            </Button>
            <Button
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
            >
              次へ: 資料・事例
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>任意資料</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="pastPerformance">過去実績（任意）</Label>
              <Textarea
                id="pastPerformance"
                rows={3}
                placeholder="例: ○○地区地質調査（2024年・テクリスNo.12345）— 軟弱地盤の精査に実績"
                value={form.pastPerformanceNotes}
                onChange={(e) => updateField("pastPerformanceNotes", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                効果欄の根拠・実績引用用。事実のみ入力してください。
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="relatedWork">関連業務メモ（任意）</Label>
              <Textarea
                id="relatedWork"
                rows={3}
                placeholder="例: 設計業務との連携、先行調査との整合"
                value={form.relatedWorkNotes}
                onChange={(e) => updateField("relatedWorkNotes", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>入札図書 PDF（推奨）</Label>
              <p className="text-sm text-muted-foreground">
                案件作成後、チェックリストタブの「PDFをアップロード」から登録できます。PDF
                が無い場合は同タブの留意事項テキスト欄が使えます。
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label>参考事例（ライブラリから選択）</Label>
              <div className="flex flex-col gap-2">
                {mockLibraryItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedLibrary(item.id)}
                    className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                      selectedLibrary === item.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="font-medium">{item.title}</div>
                    <div className="text-muted-foreground">
                      {item.branch} / {item.region} / {item.formType}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between border-t">
            <Button variant="outline" onClick={() => setStep(1)}>
              戻る
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "作成中..." : "案件を作成"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
