"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Upload, User, Mail, FileText, Briefcase, Tag, Video, Eye } from "lucide-react";
import { createInstructor } from "@/lib/supabase/mutations";

export default function NewInstructorPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [career, setCareer] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [cardImageUrl, setCardImageUrl] = useState("");
  const [cardUploading, setCardUploading] = useState(false);

  const handleCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("이미지 크기는 10MB 이하여야 합니다."); return; }
    setCardUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "instructors/cards");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError("업로드 실패: " + data.error); }
      else { setCardImageUrl(data.url); }
    } catch { setError("이미지 업로드에 실패했습니다."); }
    setCardUploading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    setImageUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "instructors");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError("이미지 업로드 실패: " + data.error);
      } else {
        setProfileImageUrl(data.url);
      }
    } catch {
      setError("이미지 업로드에 실패했습니다.");
    }
    setImageUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError("이름과 이메일은 필수입니다.");
      return;
    }

    startTransition(async () => {
      try {
        await createInstructor({
          name,
          email,
          phone: phone || undefined,
          bio: bio || undefined,
          career_summary: career || undefined,
          specialties: specialties ? specialties.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
          video_url: videoUrl || undefined,
          profile_image_url: profileImageUrl || undefined,
          profile_card_url: cardImageUrl || undefined,
          is_profile_public: isPublic,
        });
        router.push("/admin/instructors");
      } catch (err) {
        setError(err instanceof Error ? err.message : "강사 등록에 실패했습니다.");
      }
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/instructors" className="p-2 text-text-muted hover:text-primary rounded-lg hover:bg-surface transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-text">강사 등록</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* 프로필 이미지 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
            <User size={16} /> 프로필 이미지
          </h2>
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
          </div>
        </div>

        {/* 프로필 카드 이미지 (상세 페이지 하단 표시) */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
            <FileText size={16} /> 프로필 카드 이미지 (상세 페이지 하단 표시)
          </h2>
          {cardImageUrl ? (
            <div className="relative">
              <img src={cardImageUrl} alt="프로필 카드" className="w-full max-h-80 object-contain rounded-lg border" />
              <button type="button" onClick={() => setCardImageUrl("")} className="absolute top-2 right-2 bg-white/90 text-text-muted hover:text-error px-2 py-1 rounded text-xs">삭제</button>
            </div>
          ) : (
            <label className="block border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/30 transition-colors">
              <Upload size={28} className="mx-auto text-text-muted/40 mb-2" />
              <p className="text-sm text-text-sub">{cardUploading ? "업로드 중..." : "프로필 카드 이미지 업로드"}</p>
              <p className="text-xs text-text-muted mt-1">이력서/프로필 카드 이미지 (최대 10MB)</p>
              <input type="file" accept="image/*" onChange={handleCardUpload} disabled={cardUploading} className="hidden" />
            </label>
          )}
        </div>

        {/* 기본 정보 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
            <Mail size={16} /> 기본 정보
          </h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">이름 <span className="text-red-500">*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="강사 이름" required className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">이메일 <span className="text-red-500">*</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" required className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
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
          <h2 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
            <FileText size={16} /> 소개
          </h2>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="강사 소개를 입력하세요..." className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
        </div>

        {/* 경력 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
            <Briefcase size={16} /> 주요 경력
          </h2>
          <textarea value={career} onChange={(e) => setCareer(e.target.value)} rows={5} placeholder={"SK텔레콤 모바일사업부 기획\n가이스트코리아 B2B 솔루션 영업부장\n줄바꿈으로 경력을 구분합니다"} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-mono" />
        </div>

        {/* 전문분야 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
            <Tag size={16} /> 전문분야
          </h2>
          <input type="text" value={specialties} onChange={(e) => setSpecialties(e.target.value)} placeholder="AI교육, AI데이터분석, AI업무자동화" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          <p className="text-xs text-text-muted mt-1">쉼표로 구분하여 입력합니다.</p>
        </div>

        {/* 영상 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
            <Video size={16} /> 강의 소개 영상
          </h2>
          <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>

        {/* 공개 설정 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-4 h-4 accent-primary" />
            <div>
              <p className="text-sm font-medium text-text flex items-center gap-1"><Eye size={14} /> 프로필 공개</p>
              <p className="text-xs text-text-muted">강사진 페이지에 프로필이 공개됩니다.</p>
            </div>
          </label>
        </div>

        {/* 저장 */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={isPending} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50">
            <Save size={16} /> {isPending ? "등록 중..." : "강사 등록"}
          </button>
          <Link href="/admin/instructors" className="px-6 py-2.5 rounded-lg text-sm font-medium text-text-sub border border-border-light hover:bg-surface transition-colors">
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
