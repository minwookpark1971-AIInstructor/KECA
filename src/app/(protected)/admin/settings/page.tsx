"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Save, Globe, Mail, CreditCard, MessageCircle, CheckCircle, ImageIcon, Upload, Trash2, Loader2 } from "lucide-react";
import { saveSiteSettings } from "@/lib/supabase/mutations";
import { createClient } from "@/lib/supabase/client";

export default function AdminSettingsPage() {
  const [annualFee, setAnnualFee] = useState("100000");
  const [contactEmail, setContactEmail] = useState("info@keca.or.kr");
  const [kakaoUrl, setKakaoUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [blogUrl, setBlogUrl] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 기존 설정값 로드
  useEffect(() => {
    const loadSettings = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("site_settings").select("key, value");
      if (data) {
        for (const row of data) {
          if (row.key === "contact_email" && row.value) setContactEmail(row.value as string);
          if (row.key === "annual_fee" && row.value) setAnnualFee(String(row.value));
          if (row.key === "kakao_url" && row.value) setKakaoUrl(row.value as string);
          if (row.key === "youtube_url" && row.value) setYoutubeUrl(row.value as string);
          if (row.key === "blog_url" && row.value) setBlogUrl(row.value as string);
          if (row.key === "hero_image_url" && row.value) setHeroImageUrl(row.value as string);
        }
      }
    };
    loadSettings();
  }, []);

  const handleHeroUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setMsg({ type: "error", text: "이미지 파일만 업로드 가능합니다." });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMsg({ type: "error", text: "10MB 이하 파일만 업로드 가능합니다." });
      return;
    }
    setUploading(true);
    setMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "site");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHeroImageUrl(data.url);
      await saveSiteSettings([{ key: "hero_image_url", value: data.url }]);
      setMsg({ type: "success", text: "히어로 이미지가 업로드되었습니다." });
    } catch {
      setMsg({ type: "error", text: "이미지 업로드에 실패했습니다." });
    }
    setUploading(false);
  };

  const handleHeroRemove = async () => {
    setHeroImageUrl(null);
    await saveSiteSettings([{ key: "hero_image_url", value: null }]);
    setMsg({ type: "success", text: "히어로 이미지가 제거되었습니다. 기본 그라디언트가 표시됩니다." });
  };

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
        {/* 히어로 이미지 관리 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
            <ImageIcon size={16} /> 메인 히어로 배경 이미지
          </h2>
          <p className="text-xs text-text-muted mb-4">
            메인 페이지 히어로 섹션의 배경 이미지를 설정합니다. 이미지가 없으면 기본 그라디언트가 표시됩니다.
            <br />권장 사이즈: 1920×1080px 이상, 16:9 비율
          </p>

          {heroImageUrl ? (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border border-border-light aspect-[16/9]">
                <img
                  src={heroImageUrl}
                  alt="히어로 배경 이미지"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1B2A4A]/80 via-[#1B2A4A]/60 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white text-xs opacity-70">미리보기 (오버레이 적용)</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
                >
                  <Upload size={14} /> 변경
                </button>
                <button
                  onClick={handleHeroRemove}
                  className="flex items-center gap-1.5 px-4 py-2 border border-error text-error rounded-lg text-xs font-medium hover:bg-error/5 transition-colors"
                >
                  <Trash2 size={14} /> 제거
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-colors"
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={32} className="text-primary animate-spin" />
                  <span className="text-sm text-text-sub">업로드 중...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={32} className="text-text-muted" />
                  <span className="text-sm text-text-sub">클릭하여 이미지를 업로드하세요</span>
                  <span className="text-xs text-text-muted">JPG, PNG, WebP (최대 10MB)</span>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleHeroUpload(file);
              e.target.value = "";
            }}
          />
        </div>

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
