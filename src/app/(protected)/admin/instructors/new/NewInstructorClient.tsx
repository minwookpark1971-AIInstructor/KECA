"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, User, Upload, Eye, Save, CheckCircle, FileText, File,
  Briefcase, Tag, Video, X,
} from "lucide-react";
import { promoteToInstructor } from "@/lib/supabase/mutations";
import { roleLabels, roleBadgeColors } from "@/lib/utils";
import type { Profile } from "@/types";

export default function NewInstructorClient({ approvedProfiles }: { approvedProfiles: Profile[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  // 관리자 전용 설정
  const [cardImageUrl, setCardImageUrl] = useState("");
  const [cardUploading, setCardUploading] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const filteredProfiles = approvedProfiles.filter((p) => {
    if (!search) return true;
    return p.name.includes(search) || p.email.includes(search);
  });

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
      if (!res.ok) setError("업로드 실패: " + data.error);
      else setCardImageUrl(data.url);
    } catch { setError("이미지 업로드에 실패했습니다."); }
    setCardUploading(false);
  };

  const handleSubmit = () => {
    if (!selectedUser) return;
    setError(null);
    startTransition(async () => {
      try {
        await promoteToInstructor(selectedUser.id, {
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
    <div className="max-w-3xl">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {!selectedUser ? (
        /* Step 1: 회원 선택 */
        <div>
          <div className="bg-white border border-border-light rounded-xl p-6 mb-4">
            <h2 className="text-sm font-bold text-text mb-3">승인된 프로필에서 선택</h2>
            <p className="text-xs text-text-muted mb-4">
              회원이 마이페이지에서 작성하고 관리자가 승인한 프로필 목록입니다.
            </p>
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="이름 또는 이메일로 검색"
                className="w-full pl-9 pr-4 py-2.5 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="text-center py-12 bg-white border border-border-light rounded-xl">
              <User size={40} className="mx-auto text-text-muted/30 mb-3" />
              <p className="text-sm text-text-muted">
                {approvedProfiles.length === 0
                  ? "승인된 프로필이 없습니다. 회원이 먼저 프로필을 작성하고 관리자가 승인해야 합니다."
                  : "검색 결과가 없습니다."}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredProfiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => setSelectedUser(profile)}
                  className="w-full bg-white border border-border-light rounded-xl p-4 text-left hover:border-primary/30 hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                      {profile.profile_image_url ? (
                        <img src={profile.profile_image_url} alt={profile.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} className="text-primary/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-text">{profile.name}</p>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${roleBadgeColors[profile.role]}`}>
                          {roleLabels[profile.role]}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted">{profile.email}</p>
                      {profile.specialties && profile.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {profile.specialties.slice(0, 4).map((s, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <CheckCircle size={16} className="text-green-400 shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Step 2: 프로필 확인 + 추가 설정 */
        <div className="space-y-6">
          {/* 선택된 회원 정보 */}
          <div className="bg-white border border-primary/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-text">선택된 회원</h2>
              <button
                onClick={() => { setSelectedUser(null); setCardImageUrl(""); }}
                className="text-xs text-text-muted hover:text-primary flex items-center gap-1"
              >
                <X size={12} /> 다시 선택
              </button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                {selectedUser.profile_image_url ? (
                  <img src={selectedUser.profile_image_url} alt={selectedUser.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={28} className="text-primary/40" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-text">{selectedUser.name}</p>
                <p className="text-xs text-text-muted">{selectedUser.email}</p>
                {selectedUser.phone && <p className="text-xs text-text-muted">{selectedUser.phone}</p>}
              </div>
            </div>

            {/* 프로필 요약 */}
            <div className="space-y-3 pt-4 border-t border-border-light">
              {selectedUser.specialties && selectedUser.specialties.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1 flex items-center gap-1"><Tag size={12} /> 전문분야</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUser.specialties.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedUser.bio && (
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1 flex items-center gap-1"><FileText size={12} /> 소개</p>
                  <p className="text-sm text-text whitespace-pre-wrap bg-surface rounded-lg p-3 line-clamp-4">{selectedUser.bio}</p>
                </div>
              )}
              {selectedUser.career_summary && (
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1 flex items-center gap-1"><Briefcase size={12} /> 주요 경력</p>
                  <div className="text-sm text-text bg-surface rounded-lg p-3 space-y-0.5">
                    {selectedUser.career_summary.split("\n").slice(0, 5).map((line, i) => <p key={i}>{line}</p>)}
                  </div>
                </div>
              )}
              {selectedUser.video_url && (
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1 flex items-center gap-1"><Video size={12} /> 영상</p>
                  <a href={selectedUser.video_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">{selectedUser.video_url}</a>
                </div>
              )}
              {selectedUser.profile_pdf_url && (
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1 flex items-center gap-1"><File size={12} /> PDF 프로필</p>
                  <a href={selectedUser.profile_pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                    <File size={14} className="text-red-500" /> PDF 보기
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 프로필 카드 이미지 (관리자 전용) */}
          <div className="bg-white border border-border-light rounded-xl p-6">
            <h2 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
              <FileText size={16} /> 프로필 카드 이미지 (관리자 전용, 선택)
            </h2>
            <p className="text-xs text-text-muted mb-3">강사 상세 페이지 하단에 표시되는 카드 이미지입니다.</p>
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

          {/* 등록 */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
            >
              <Save size={16} /> {isPending ? "등록 중..." : "강사 등록"}
            </button>
            <Link href="/admin/instructors" className="px-6 py-2.5 rounded-lg text-sm font-medium text-text-sub border border-border-light hover:bg-surface transition-colors">
              취소
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
