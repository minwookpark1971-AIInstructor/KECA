"use client";

import { useState, useTransition } from "react";
import { Save, CheckCircle } from "lucide-react";
import { saveSiteSettings } from "@/lib/supabase/mutations";

const sections = [
  { key: "overview", label: "자격 개요", placeholder: "자격명, 등록 구분, 유효기간, 직무 내용 등" },
  { key: "standards", label: "검정기준 및 과목", placeholder: "필기/실기 과목, 시험 시간, 합격 기준 등" },
  { key: "apply", label: "자격증 신청안내", placeholder: "지원 자격, 수수료, 신청 방법, 일정 등" },
  { key: "graduates", label: "배출현황", placeholder: "배출 인원, 활동 분야, 목표 등" },
];

interface CertData { [key: string]: string }

export default function CertificationAdminClient({ initialData }: { initialData: CertData }) {
  const [data, setData] = useState<CertData>(initialData);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const handleSave = () => {
    startTransition(async () => {
      try {
        const settings = sections.map((s) => ({
          key: `cert_${s.key}`,
          value: data[s.key] || "",
        }));
        await saveSiteSettings(settings);
        setMsg({ type: "success", text: "저장되었습니다." });
        setTimeout(() => setMsg(null), 3000);
      } catch {
        setMsg({ type: "error", text: "저장에 실패했습니다." });
      }
    });
  };

  const current = sections.find((s) => s.key === activeTab)!;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">자격소개 관리</h1>
        <button onClick={handleSave} disabled={isPending} className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-light disabled:opacity-50 transition-colors">
          <Save size={16} /> {isPending ? "저장 중..." : "전체 저장"}
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.type === "success" && <CheckCircle size={16} />} {msg.text}
        </div>
      )}

      <div className="flex flex-wrap gap-1 mb-6 bg-white border border-border-light rounded-lg p-1">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveTab(s.key)}
            className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${activeTab === s.key ? "bg-primary text-white" : "text-text-sub hover:bg-surface"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-border-light rounded-xl p-6">
        <h2 className="text-lg font-bold text-text mb-1">{current.label}</h2>
        <p className="text-xs text-text-muted mb-4">DB에 내용이 없으면 기존 하드코딩 내용이 표시됩니다.</p>
        <textarea
          value={data[activeTab] || ""}
          onChange={(e) => setData((prev) => ({ ...prev, [activeTab]: e.target.value }))}
          rows={15}
          placeholder={current.placeholder}
          className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y font-mono"
        />
      </div>
    </div>
  );
}
