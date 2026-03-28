"use client";

import { useState, useTransition } from "react";
import { Save, Globe, Mail, CreditCard, MessageCircle, CheckCircle } from "lucide-react";
import { saveSiteSettings } from "@/lib/supabase/mutations";

export default function AdminSettingsPage() {
  const [annualFee, setAnnualFee] = useState("100000");
  const [contactEmail, setContactEmail] = useState("info@keca.or.kr");
  const [kakaoUrl, setKakaoUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [blogUrl, setBlogUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveSiteSettings([
          { key: "contact_email", value: contactEmail },
          { key: "annual_fee", value: Number(annualFee) },
          { key: "kakao_url", value: kakaoUrl },
          { key: "youtube_url", value: youtubeUrl },
          { key: "blog_url", value: blogUrl },
        ]);
        setMsg({ type: "success", text: "설정이 저장되었습니다." });
      } catch {
        setMsg({ type: "error", text: "설정 저장에 실패했습니다." });
      }
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">사이트 설정</h1>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.type === "success" && <CheckCircle size={16} />}
          {msg.text}
        </div>
      )}

      <div className="space-y-6 max-w-2xl">
        {/* 기본 설정 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
            <Globe size={16} /> 기본 설정
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">대표 이메일</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
          </div>
        </div>

        {/* 결제 설정 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
            <CreditCard size={16} /> 결제 설정
          </h2>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">연간 협회비 (원)</label>
            <input type="number" value={annualFee} onChange={(e) => setAnnualFee(e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        {/* 퀵메뉴 링크 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
            <MessageCircle size={16} /> 퀵메뉴 링크
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">카카오 상담 URL</label>
              <input type="url" value={kakaoUrl} onChange={(e) => setKakaoUrl(e.target.value)} placeholder="https://pf.kakao.com/..." className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">유튜브 채널 URL</label>
              <input type="url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/@..." className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">블로그 URL</label>
              <input type="url" value={blogUrl} onChange={(e) => setBlogUrl(e.target.value)} placeholder="https://blog.naver.com/..." className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
        >
          <Save size={16} /> {isPending ? "저장 중..." : "설정 저장"}
        </button>
      </div>
    </div>
  );
}
