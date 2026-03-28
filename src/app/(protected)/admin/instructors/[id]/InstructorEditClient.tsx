"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Upload, User, FileText, Briefcase, Tag, Video, Eye } from "lucide-react";
import { updateInstructor } from "@/lib/supabase/mutations";
import type { Profile } from "@/types";

export default function InstructorEditClient({ instructor }: { instructor: Profile }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [name, setName] = useState(instructor.name);
  const [phone, setPhone] = useState(instructor.phone || "");
  const [bio, setBio] = useState(instructor.bio || "");
  const [career, setCareer] = useState(instructor.career_summary || "");
  const [specialties, setSpecialties] = useState((instructor.specialties || []).join(", "));
  const [videoUrl, setVideoUrl] = useState(instructor.video_url || "");
  const [isPublic, setIsPublic] = useState(instructor.is_profile_public ?? false);
  const [profileImageUrl, setProfileImageUrl] = useState(instructor.profile_image_url || "");
  const [cardImageUrl, setCardImageUrl] = useState(instructor.profile_card_url || "");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File, folder: string, setter: (url: string) => void) => {
    if (file.size > 10 * 1024 * 1024) { setMsg({ type: "error", text: "10MB 이하만 가능합니다." }); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setMsg({ type: "error", text: "업로드 실패: " + data.error }); }
      else { setter(data.url); }
    } catch { setMsg({ type: "error", text: "업로드에 실패했습니다." }); }
    setUploading(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      try {
        await updateInstructor(instructor.id, {
          name,
          phone: phone || undefined,
          bio: bio || undefined,
          career_summary: career || undefined,
          specialties: specialties ? specialties.split(",").map(s => s.trim()).filter(Boolean) : [],
          video_url: videoUrl || null,
          is_profile_public: isPublic,
          profile_image_url: profileImageUrl || null,
          profile_card_url: cardImageUrl || null,
        });
        setMsg({ type: "success", text: "강사 정보가 저장되었습니다." });
        router.refresh();
      } catch {
        setMsg({ type: "error", text: "저장에 실패했습니다." });
      }
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/instructors" className="p-2 text-text-muted hover:text-primary rounded-lg hover:bg-surface transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-text">강사 수정 — {instructor.name}</h1>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* 프로필 이미지 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4 flex items-center gap-2"><User size={16} /> 프로필 이미지</h2>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-primary/40" />
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 bg-surface text-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-border-light transition-colors cursor-pointer">
                <Upload size={14} /> {uploading ? "업로드 중..." : "이미지 변경"}
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, "instructors", setProfileImageUrl); }} disabled={uploading} className="hidden" />
              </label>
              {profileImageUrl && <button type="button" onClick={() => setProfileImageUrl("")} className="text-xs text-error hover:underline mt-1 block">삭제</button>}
            </div>
          </div>
        </div>

        {/* 프로필 카드 이미지 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4 flex items-center gap-2"><FileText size={16} /> 프로필 카드 이미지 (상세 페이지 하단)</h2>
          {cardImageUrl ? (
            <div>
              <img src={cardImageUrl} alt="프로필 카드" className="w-full max-h-80 object-contain rounded-lg border mb-3" />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 bg-surface text-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-border-light transition-colors cursor-pointer">
                  <Upload size={14} /> {uploading ? "업로드 중..." : "이미지 변경"}
                  <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, "instructors/cards", setCardImageUrl); }} disabled={uploading} className="hidden" />
                </label>
                <button type="button" onClick={() => setCardImageUrl("")} className="text-xs text-error hover:underline">삭제</button>
              </div>
            </div>
          ) : (
            <label className="block border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/30 transition-colors">
              <Upload size={28} className="mx-auto text-text-muted/40 mb-2" />
              <p className="text-sm text-text-sub">{uploading ? "업로드 중..." : "프로필 카드 이미지 업로드"}</p>
              <p className="text-xs text-text-muted mt-1">이력서/프로필 카드 (최대 10MB)</p>
              <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, "instructors/cards", setCardImageUrl); }} disabled={uploading} className="hidden" />
            </label>
          )}
        </div>

        {/* 기본 정보 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4">기본 정보</h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">이름</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">이메일</label>
                <input type="email" value={instructor.email} disabled className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-surface text-text-muted" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">연락처</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
        </div>

        {/* 소개 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4 flex items-center gap-2"><FileText size={16} /> 소개</h2>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="강사 소개" className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
        </div>

        {/* 경력 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4 flex items-center gap-2"><Briefcase size={16} /> 주요 경력</h2>
          <textarea value={career} onChange={(e) => setCareer(e.target.value)} rows={5} placeholder="줄바꿈으로 구분" className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-mono" />
        </div>

        {/* 전문분야 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4 flex items-center gap-2"><Tag size={16} /> 전문분야</h2>
          <input type="text" value={specialties} onChange={(e) => setSpecialties(e.target.value)} placeholder="AI교육, 데이터분석" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          <p className="text-xs text-text-muted mt-1">쉼표로 구분</p>
        </div>

        {/* 영상 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4 flex items-center gap-2"><Video size={16} /> 강의 소개 영상</h2>
          <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>

        {/* 공개 설정 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-4 h-4 accent-primary" />
            <div>
              <p className="text-sm font-medium text-text flex items-center gap-1"><Eye size={14} /> 프로필 공개</p>
              <p className="text-xs text-text-muted">강사진 페이지에 공개됩니다.</p>
            </div>
          </label>
        </div>

        {/* 저장 */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={isPending} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50">
            <Save size={16} /> {isPending ? "저장 중..." : "저장"}
          </button>
          <Link href="/admin/instructors" className="px-6 py-2.5 rounded-lg text-sm font-medium text-text-sub border border-border-light hover:bg-surface transition-colors">
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
