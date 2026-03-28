"use client";

import { useState, useTransition } from "react";
import { Save, CheckCircle } from "lucide-react";
import { saveSiteSettings } from "@/lib/supabase/mutations";

const sections = [
  { key: "greeting", label: "인사말", placeholder: "협회장 인사말 내용을 입력하세요" },
  { key: "vision", label: "비전/미션", placeholder: "비전, 미션, 핵심가치 등" },
  { key: "organization", label: "조직현황", placeholder: "조직도, 주요 임원 소개 등" },
  { key: "history", label: "연혁", placeholder: "주요 연혁을 연도별로 입력 (예: 2025.04 협회 설립)" },
  { key: "achievements", label: "대표실적", placeholder: "주요 사업 실적, 통계 등" },
  { key: "benefits", label: "회원혜택", placeholder: "회원 가입 시 혜택 내용" },
  { key: "location", label: "오시는길", placeholder: "주소, 교통 안내, 연락처 등" },
];

interface AboutData { [key: string]: string }

export default function AboutAdminClient({ initialData }: { initialData: AboutData }) {
  const [data, setData] = useState<AboutData>(initialData);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState("greeting");

  const handleSave = () => {
    startTransition(async () => {
      try {
        const settings = sections.map((s) => ({
          key: `about_${s.key}`,
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
        <h1 className="text-2xl font-bold text-text">협회소개 관리</h1>
        <button onClick={handleSave} disabled={isPending} className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-light disabled:opacity-50 transition-colors">
          <Save size={16} /> {isPending ? "저장 중..." : "전체 저장"}
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.type === "success" && <CheckCircle size={16} />} {msg.text}
        </div>
      )}

      {/* 탭 네비게이션 */}
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

      {/* 편집 영역 */}
      <div className="bg-white border border-border-light rounded-xl p-6">
        <h2 className="text-lg font-bold text-text mb-1">{current.label}</h2>
        <p className="text-xs text-text-muted mb-4">이 내용은 공개 페이지 /about/{current.key === "greeting" ? "" : current.key === "vision" ? "vision" : current.key === "organization" ? "organization" : current.key === "history" ? "history" : current.key === "achievements" ? "achievements" : current.key === "benefits" ? "benefits" : "location"}에 표시됩니다. DB에 내용이 없으면 기존 하드코딩 내용이 표시됩니다.</p>
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
