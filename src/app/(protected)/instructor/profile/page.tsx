"use client";

import { useState } from "react";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { mockUsers } from "@/lib/mock-auth";
import { Save, Upload, Video, User, Briefcase, Tag, FileText } from "lucide-react";

export default function InstructorProfilePage() {
  const instructor = mockUsers.find((u) => u.role === "instructor")!;

  const [bio, setBio] = useState(instructor.bio || "");
  const [career, setCareer] = useState(instructor.career_summary || "");
  const [specialties, setSpecialties] = useState((instructor.specialties || []).join(", "));
  const [videoUrl, setVideoUrl] = useState(instructor.video_url || "");
  const [isPublic, setIsPublic] = useState(instructor.is_profile_public ?? false);
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      alert("목업 모드: 프로필이 저장되었습니다.");
      setSaving(false);
    }, 500);
  };

  return (
    <>
      <SubpageHero
        title="강사 프로필 관리"
        breadcrumb={[{ label: "강사", href: "/instructor" }, { label: "프로필 관리" }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-2xl">
          <form onSubmit={handleSave} className="space-y-6">
            {/* 프로필 이미지 */}
            <div className="bg-white border border-border-light rounded-2xl p-6">
              <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                <User size={20} /> 프로필 이미지
              </h2>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <User size={40} className="text-primary/40" />
                </div>
                <div>
                  <button
                    type="button"
                    className="flex items-center gap-2 bg-surface text-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-border-light transition-colors"
                  >
                    <Upload size={14} /> 이미지 업로드
                  </button>
                  <p className="text-xs text-text-muted mt-1.5">PNG, JPG (최대 5MB)</p>
                </div>
              </div>
            </div>

            {/* 소개 */}
            <div className="bg-white border border-border-light rounded-2xl p-6">
              <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                <FileText size={20} /> 소개
              </h2>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="강사 소개를 입력하세요..."
                className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            {/* 경력 */}
            <div className="bg-white border border-border-light rounded-2xl p-6">
              <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                <Briefcase size={20} /> 주요 경력
              </h2>
              <textarea
                value={career}
                onChange={(e) => setCareer(e.target.value)}
                rows={5}
                placeholder={"現) 소속/직위\n前) 이전 경력\n前) 이전 경력"}
                className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-mono"
              />
              <p className="text-xs text-text-muted mt-1">줄바꿈으로 경력을 구분합니다.</p>
            </div>

            {/* 전문분야 */}
            <div className="bg-white border border-border-light rounded-2xl p-6">
              <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                <Tag size={20} /> 전문분야
              </h2>
              <input
                type="text"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                placeholder="AI교육, 데이터분석, 에듀테크"
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-xs text-text-muted mt-1">쉼표로 구분하여 입력합니다.</p>
            </div>

            {/* 영상 */}
            <div className="bg-white border border-border-light rounded-2xl p-6">
              <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                <Video size={20} /> 강의 소개 영상
              </h2>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-xs text-text-muted mt-1">유튜브 URL 또는 업로드된 영상 URL</p>
            </div>

            {/* 공개 설정 */}
            <div className="bg-white border border-border-light rounded-2xl p-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <div>
                  <p className="text-sm font-medium text-text">프로필 공개</p>
                  <p className="text-xs text-text-muted">강사진 페이지에 프로필이 공개됩니다.</p>
                </div>
              </label>
            </div>

            {/* 저장 */}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary-light transition-colors disabled:opacity-50"
            >
              <Save size={16} /> {saving ? "저장 중..." : "프로필 저장"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
