"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubpageHero } from "@/components/layout/SubpageHero";
import {
  Save, Upload, Video, User, Briefcase, Tag, FileText,
  CheckCircle, AlertCircle, Clock, Send, Edit3, XCircle, File,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, ProfileStatus } from "@/types";

const statusConfig: Record<ProfileStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  none: { label: "미작성", color: "bg-gray-100 text-gray-600", icon: Edit3 },
  draft: { label: "임시저장", color: "bg-yellow-100 text-yellow-700", icon: Edit3 },
  submitted: { label: "검토 중", color: "bg-blue-100 text-blue-700", icon: Clock },
  approved: { label: "승인됨", color: "bg-green-100 text-green-700", icon: CheckCircle },
  rejected: { label: "반려됨", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function InstructorProfileEditForm({ user }: { user: Profile }) {
  const router = useRouter();
  const currentStatus = (user.profile_status as ProfileStatus) || "none";
  const isReadOnly = currentStatus === "submitted" || currentStatus === "approved";

  const [bio, setBio] = useState(user.bio || "");
  const [career, setCareer] = useState(user.career_summary || "");
  const [specialties, setSpecialties] = useState((user.specialties || []).join(", "));
  const [videoUrl, setVideoUrl] = useState(user.video_url || "");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 이미지 업로드
  const [imageUploading, setImageUploading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(user.profile_image_url || "");

  // PDF 업로드
  const [pdfUploading, setPdfUploading] = useState(false);
  const [profilePdfUrl, setProfilePdfUrl] = useState(user.profile_pdf_url || "");

  // 편집 모드 전환 (submitted/approved 상태에서 수정 시)
  const [editMode, setEditMode] = useState(false);
  const canEdit = !isReadOnly || editMode;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type: "error", text: "이미지 크기는 5MB 이하여야 합니다." });
      return;
    }
    setImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", `profiles/${user.id}`);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "error", text: "이미지 업로드 실패: " + data.error });
      } else {
        setProfileImageUrl(data.url);
      }
    } catch {
      setMsg({ type: "error", text: "이미지 업로드에 실패했습니다." });
    }
    setImageUploading(false);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setMsg({ type: "error", text: "PDF 크기는 10MB 이하여야 합니다." });
      return;
    }
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setMsg({ type: "error", text: "PDF 파일만 업로드 가능합니다." });
      return;
    }
    setPdfUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", `profiles/${user.id}`);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "error", text: "PDF 업로드 실패: " + data.error });
      } else {
        setProfilePdfUrl(data.url);
      }
    } catch {
      setMsg({ type: "error", text: "PDF 업로드에 실패했습니다." });
    }
    setPdfUploading(false);
  };

  const handleSave = async (submit: boolean) => {
    setMsg(null);

    if (submit) {
      if (!bio.trim()) {
        setMsg({ type: "error", text: "소개글을 입력해주세요." });
        return;
      }
      if (!specialties.trim()) {
        setMsg({ type: "error", text: "전문분야를 1개 이상 입력해주세요." });
        return;
      }
    }

    setSaving(true);
    const supabase = createClient();

    const updateData: Record<string, unknown> = {
      bio,
      career_summary: career,
      specialties: specialties.split(",").map((s) => s.trim()).filter(Boolean),
      video_url: videoUrl || null,
      profile_image_url: profileImageUrl || null,
      profile_pdf_url: profilePdfUrl || null,
      profile_status: submit ? "submitted" : "draft",
      profile_reject_reason: null,
    };

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);

    if (error) {
      setMsg({ type: "error", text: "저장에 실패했습니다." });
    } else {
      setMsg({
        type: "success",
        text: submit ? "프로필이 제출되었습니다. 관리자 검토 후 결과를 안내드립니다." : "임시 저장되었습니다.",
      });
      setEditMode(false);
      router.refresh();
    }
    setSaving(false);
  };

  const handleEnterEditMode = () => {
    setEditMode(true);
    setMsg({
      type: "error",
      text: currentStatus === "approved"
        ? "수정 후 재제출이 필요합니다. 재제출 전까지 기존 승인 상태가 유지됩니다."
        : "수정 모드로 전환되었습니다.",
    });
  };

  const stCfg = statusConfig[currentStatus];
  const StatusIcon = stCfg.icon;

  return (
    <>
      <SubpageHero
        title="강사 프로필"
        breadcrumb={[{ label: "마이페이지", href: "/mypage" }, { label: "강사 프로필" }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-2xl">
          {/* 상태 배너 */}
          {currentStatus !== "none" && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
              currentStatus === "rejected" ? "bg-red-50 border border-red-200" :
              currentStatus === "submitted" ? "bg-blue-50 border border-blue-200" :
              currentStatus === "approved" ? "bg-green-50 border border-green-200" :
              "bg-yellow-50 border border-yellow-200"
            }`}>
              <StatusIcon size={20} className={`shrink-0 mt-0.5 ${
                currentStatus === "rejected" ? "text-red-500" :
                currentStatus === "submitted" ? "text-blue-500" :
                currentStatus === "approved" ? "text-green-500" :
                "text-yellow-500"
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${stCfg.color}`}>
                    {stCfg.label}
                  </span>
                </div>
                {currentStatus === "rejected" && user.profile_reject_reason && (
                  <p className="text-sm text-red-700">반려 사유: {user.profile_reject_reason}</p>
                )}
                {currentStatus === "submitted" && (
                  <p className="text-sm text-blue-700">관리자가 프로필을 검토 중입니다.</p>
                )}
                {currentStatus === "approved" && (
                  <p className="text-sm text-green-700">프로필이 승인되었습니다.</p>
                )}
              </div>
              {isReadOnly && !editMode && (
                <button
                  onClick={handleEnterEditMode}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-border-light text-text-sub hover:bg-surface transition-colors"
                >
                  <Edit3 size={12} /> 수정하기
                </button>
              )}
            </div>
          )}

          {msg && (
            <div className={`mb-6 p-3 rounded-lg text-sm flex items-center gap-2 ${msg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
              {msg.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {msg.text}
            </div>
          )}

          <div className="space-y-6">
            {/* 프로필 이미지 */}
            <div className="bg-white border border-border-light rounded-2xl p-6">
              <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                <User size={20} /> 프로필 이미지
              </h2>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="프로필" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-primary/40" />
                  )}
                </div>
                {canEdit && (
                  <div>
                    <label className="flex items-center gap-2 bg-surface text-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-border-light transition-colors cursor-pointer">
                      <Upload size={14} /> {imageUploading ? "업로드 중..." : "이미지 업로드"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleImageUpload}
                        disabled={imageUploading}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-text-muted mt-1.5">PNG, JPG (최대 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* 소개 */}
            <div className="bg-white border border-border-light rounded-2xl p-6">
              <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                <FileText size={20} /> 소개 <span className="text-red-500 text-sm">*</span>
              </h2>
              {canEdit ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="강사 소개를 입력하세요..."
                  className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              ) : (
                <p className="text-sm text-text whitespace-pre-wrap">{bio || "-"}</p>
              )}
            </div>

            {/* 경력 */}
            <div className="bg-white border border-border-light rounded-2xl p-6">
              <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                <Briefcase size={20} /> 주요 경력
              </h2>
              {canEdit ? (
                <>
                  <textarea
                    value={career}
                    onChange={(e) => setCareer(e.target.value)}
                    rows={5}
                    placeholder={"現) 소속/직위\n前) 이전 경력\n前) 이전 경력"}
                    className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-mono"
                  />
                  <p className="text-xs text-text-muted mt-1">줄바꿈으로 경력을 구분합니다.</p>
                </>
              ) : (
                <div className="text-sm text-text space-y-1">
                  {career ? career.split("\n").map((line, i) => <p key={i}>{line}</p>) : <p>-</p>}
                </div>
              )}
            </div>

            {/* 전문분야 */}
            <div className="bg-white border border-border-light rounded-2xl p-6">
              <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                <Tag size={20} /> 전문분야 <span className="text-red-500 text-sm">*</span>
              </h2>
              {canEdit ? (
                <>
                  <input
                    type="text"
                    value={specialties}
                    onChange={(e) => setSpecialties(e.target.value)}
                    placeholder="AI교육, 데이터분석, 에듀테크"
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <p className="text-xs text-text-muted mt-1">쉼표로 구분하여 입력합니다.</p>
                </>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(user.specialties || []).map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">{s}</span>
                  ))}
                  {(!user.specialties || user.specialties.length === 0) && <p className="text-sm text-text-muted">-</p>}
                </div>
              )}
            </div>

            {/* 영상 */}
            <div className="bg-white border border-border-light rounded-2xl p-6">
              <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                <Video size={20} /> 강의 소개 영상
              </h2>
              {canEdit ? (
                <>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <p className="text-xs text-text-muted mt-1">유튜브 URL을 입력하세요.</p>
                </>
              ) : (
                videoUrl ? (
                  <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{videoUrl}</a>
                ) : (
                  <p className="text-sm text-text-muted">-</p>
                )
              )}
            </div>

            {/* PDF 프로필 */}
            <div className="bg-white border border-border-light rounded-2xl p-6">
              <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                <File size={20} /> PDF 프로필
              </h2>
              {profilePdfUrl && (
                <div className="mb-4 p-3 bg-surface rounded-lg flex items-center gap-3">
                  <File size={20} className="text-red-500 shrink-0" />
                  <a
                    href={profilePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline truncate flex-1"
                  >
                    프로필 PDF 보기
                  </a>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setProfilePdfUrl("")}
                      className="text-xs text-text-muted hover:text-error"
                    >
                      삭제
                    </button>
                  )}
                </div>
              )}
              {canEdit && (
                <div>
                  <label className="flex items-center gap-2 bg-surface text-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-border-light transition-colors cursor-pointer w-fit">
                    <Upload size={14} /> {pdfUploading ? "업로드 중..." : "PDF 업로드"}
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      disabled={pdfUploading}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-text-muted mt-1.5">PDF 파일 (최대 10MB)</p>
                </div>
              )}
            </div>

            {/* 저장/제출 버튼 */}
            {canEdit && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-surface text-text py-3 rounded-xl font-semibold text-sm hover:bg-border-light transition-colors disabled:opacity-50 border border-border-light"
                >
                  <Save size={16} /> {saving ? "저장 중..." : "임시저장"}
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary-light transition-colors disabled:opacity-50"
                >
                  <Send size={16} /> {saving ? "제출 중..." : currentStatus === "rejected" ? "재제출" : "제출하기"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
