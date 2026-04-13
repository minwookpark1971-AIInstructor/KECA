"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { roleLabels, roleBadgeColors, instructorBadgeColor } from "@/lib/utils";
import { UserCheck, Search, Trash2, Eye, X, CheckCircle, XCircle, RotateCcw, File, GraduationCap, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  approveMember,
  changeUserRole,
  deleteMember,
  promoteToInstructor,
  demoteInstructor,
  approveInstructorProfile,
  rejectInstructorProfile,
  resetInstructorProfile,
  logDownloadAudit,
} from "@/lib/supabase/mutations";
import type { Profile, ProfileStatus } from "@/types";
import MemberDownloadModal from "./MemberDownloadModal";
import MemberActionBar from "./MemberActionBar";

const profileStatusLabels: Record<string, string> = {
  none: "미작성",
  draft: "작성중",
  submitted: "검토대기",
  approved: "승인",
  rejected: "반려",
};

const profileStatusColors: Record<string, string> = {
  none: "bg-gray-100 text-gray-500",
  draft: "bg-yellow-100 text-yellow-700",
  submitted: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function MembersClient({ members }: { members: Profile[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [approveRoles, setApproveRoles] = useState<Record<string, string>>({});

  // 프로필 검토 모달
  const [reviewUser, setReviewUser] = useState<Profile | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  // 강사 승격 모달
  const [promotingUser, setPromotingUser] = useState<Profile | null>(null);

  // 다운로드 모달
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // 회원 선택 (마케팅)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = members.filter((u) => {
    if (filter === "instructor") {
      if (!u.is_instructor) return false;
    } else if (filter !== "all" && filter !== "profile_submitted") {
      if (u.role !== filter) return false;
    }
    if (filter === "profile_submitted" && u.profile_status !== "submitted") return false;
    if (search && !u.name.includes(search) && !u.email.includes(search)) return false;
    return true;
  });

  const getApproveRole = (userId: string) => approveRoles[userId] || "associate";
  const submittedCount = members.filter((m) => m.profile_status === "submitted").length;

  // 체크박스 핸들러
  const isAllSelected = filtered.length > 0 && filtered.every((m) => selectedIds.has(m.id));
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((m) => m.id)));
    }
  };
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 다운로드 완료 콜백
  const handleDownloaded = (recordCount: number, downloadFormat: string, fields: string[]) => {
    logDownloadAudit({
      adminId: "", // server action에서 처리
      downloadType: `member_list_${downloadFormat}`,
      recordCount,
      filtersApplied: { filter, search },
      fieldsIncluded: fields,
    }).catch(() => {});
  };

  const handleApprove = (userId: string) => {
    const role = getApproveRole(userId);
    startTransition(async () => {
      try {
        await approveMember(userId, role);
        setMsg({ type: "success", text: `회원이 ${roleLabels[role] || role}(으)로 승인되었습니다.` });
      } catch {
        setMsg({ type: "error", text: "승인 처리에 실패했습니다." });
      }
    });
  };

  const handleChangeRole = (userId: string, role: string) => {
    startTransition(async () => {
      try {
        await changeUserRole(userId, role);
        setMsg({ type: "success", text: "역할이 변경되었습니다." });
      } catch {
        setMsg({ type: "error", text: "역할 변경에 실패했습니다." });
      }
    });
  };

  const handlePromote = (action: "role_only" | "with_profile") => {
    if (!promotingUser) return;
    const userId = promotingUser.id;
    startTransition(async () => {
      try {
        await promoteToInstructor(userId);
        setMsg({ type: "success", text: "강사로 지정되었습니다." });
        setPromotingUser(null);
        if (action === "with_profile") {
          router.push(`/admin/instructors/${userId}`);
        }
      } catch {
        setMsg({ type: "error", text: "역할 변경에 실패했습니다." });
      }
    });
  };

  const handleDelete = (userId: string, userName: string) => {
    if (!confirm(`"${userName}" 회원을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
    startTransition(async () => {
      try {
        await deleteMember(userId);
        setMsg({ type: "success", text: "회원이 삭제되었습니다." });
      } catch {
        setMsg({ type: "error", text: "회원 삭제에 실패했습니다." });
      }
    });
  };

  // 프로필 검토 핸들러
  const handleProfileApprove = () => {
    if (!reviewUser) return;
    startTransition(async () => {
      try {
        await approveInstructorProfile(reviewUser.id);
        setMsg({ type: "success", text: `${reviewUser.name}님의 프로필이 승인되었습니다.` });
        setReviewUser(null);
      } catch {
        setMsg({ type: "error", text: "프로필 승인에 실패했습니다." });
      }
    });
  };

  const handleProfileReject = () => {
    if (!reviewUser || !rejectReason.trim()) return;
    startTransition(async () => {
      try {
        await rejectInstructorProfile(reviewUser.id, rejectReason.trim());
        setMsg({ type: "success", text: `${reviewUser.name}님의 프로필이 반려되었습니다.` });
        setReviewUser(null);
        setRejectReason("");
        setShowRejectInput(false);
      } catch {
        setMsg({ type: "error", text: "프로필 반려에 실패했습니다." });
      }
    });
  };

  const handleProfileReset = (user: Profile) => {
    if (!confirm(`${user.name}님의 프로필을 초기화하시겠습니까?\n회원에게 재작성 요청이 전달됩니다.`)) return;
    startTransition(async () => {
      try {
        await resetInstructorProfile(user.id);
        setMsg({ type: "success", text: `${user.name}님의 프로필이 초기화되었습니다.` });
      } catch {
        setMsg({ type: "error", text: "프로필 초기화에 실패했습니다." });
      }
    });
  };

  const getProfileStatus = (user: Profile): ProfileStatus => {
    return (user.profile_status as ProfileStatus) || "none";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">회원관리</h1>
        <button
          onClick={() => setShowDownloadModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-border-light text-sm font-medium text-text-sub rounded-lg hover:bg-surface transition-colors"
        >
          <Download size={15} />
          회원목록 다운로드
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      {/* 필터 + 검색 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1 bg-white border border-border-light rounded-lg p-1 flex-wrap">
          {[
            { key: "all", label: "전체" },
            { key: "pending", label: "승인대기" },
            { key: "approved", label: "승인완료" },
            { key: "associate", label: "준회원" },
            { key: "member", label: "정회원" },
            { key: "instructor", label: "강사" },
            { key: "profile_submitted", label: `프로필 검토대기${submittedCount > 0 ? ` (${submittedCount})` : ""}` },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                filter === f.key ? "bg-primary text-white" : "text-text-sub hover:bg-surface",
                f.key === "profile_submitted" && submittedCount > 0 && filter !== f.key && "text-blue-600 bg-blue-50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 또는 이메일 검색"
            className="w-full pl-9 pr-4 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* 회원 테이블 */}
      <div className="bg-white border border-border-light rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border-light text-text-sub">
                <th className="text-center px-2 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-border text-primary focus:ring-primary/20"
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium">이름</th>
                <th className="text-left px-4 py-3 font-medium">이메일</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">연락처</th>
                <th className="text-center px-4 py-3 font-medium">상태</th>
                <th className="text-center px-4 py-3 font-medium hidden lg:table-cell">프로필</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">가입일</th>
                <th className="text-center px-4 py-3 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filtered.map((user) => {
                const ps = getProfileStatus(user);
                return (
                  <tr key={user.id} className={cn("hover:bg-surface/50", selectedIds.has(user.id) && "bg-primary/5")}>
                    <td className="text-center px-2 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="rounded border-border text-primary focus:ring-primary/20"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-text">{user.name}</td>
                    <td className="px-4 py-3 text-text-sub">{user.email}</td>
                    <td className="px-4 py-3 text-text-sub hidden sm:table-cell">{user.phone || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${roleBadgeColors[user.role]}`}>
                          {roleLabels[user.role]}
                        </span>
                        {user.is_instructor && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${instructorBadgeColor}`}>
                            강사
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${profileStatusColors[ps]}`}>
                          {profileStatusLabels[ps]}
                        </span>
                        {ps === "submitted" && (
                          <button
                            onClick={() => { setReviewUser(user); setShowRejectInput(false); setRejectReason(""); }}
                            className="p-1 text-blue-500 hover:text-blue-700 rounded"
                            title="프로필 검토"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                        {ps === "approved" && (
                          <button
                            onClick={() => handleProfileReset(user)}
                            disabled={isPending}
                            className="p-1 text-text-muted hover:text-orange-500 rounded disabled:opacity-50"
                            title="프로필 초기화"
                          >
                            <RotateCcw size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-muted hidden md:table-cell">
                      {new Date(user.created_at).toLocaleDateString("ko")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {user.role === "pending" ? (
                          <>
                            <select
                              value={getApproveRole(user.id)}
                              onChange={(e) =>
                                setApproveRoles((prev) => ({ ...prev, [user.id]: e.target.value }))
                              }
                              className="text-xs border border-border-light rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary/30"
                            >
                              <option value="associate">준회원</option>
                              <option value="member">정회원</option>
                            </select>
                            <button
                              onClick={() => handleApprove(user.id)}
                              disabled={isPending}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-success/10 text-success text-xs font-medium rounded-md hover:bg-success/20 transition-colors disabled:opacity-50"
                            >
                              <UserCheck size={12} /> 승인
                            </button>
                          </>
                        ) : (
                          <>
                          <select
                            value={user.role}
                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                            disabled={isPending}
                            className="text-xs border border-border-light rounded-md px-2 py-1 focus:outline-none disabled:opacity-50"
                          >
                            <option value="approved">승인완료</option>
                            <option value="associate">준회원</option>
                            <option value="member">정회원</option>
                            <option value="admin">관리자</option>
                          </select>
                          {user.role !== "admin" && (
                            <button
                              onClick={() => {
                                if (user.is_instructor) {
                                  if (!confirm(`${user.name}님의 강사 지정을 해제하시겠습니까?`)) return;
                                  startTransition(async () => {
                                    try {
                                      await demoteInstructor(user.id);
                                      setMsg({ type: "success", text: "강사 지정이 해제되었습니다." });
                                    } catch {
                                      setMsg({ type: "error", text: "강사 해제에 실패했습니다." });
                                    }
                                  });
                                } else {
                                  setPromotingUser(user);
                                }
                              }}
                              disabled={isPending}
                              className={cn(
                                "p-1 rounded transition-colors disabled:opacity-50",
                                user.is_instructor
                                  ? "text-purple-600 hover:text-purple-800 bg-purple-50"
                                  : "text-text-muted hover:text-purple-600"
                              )}
                              title={user.is_instructor ? "강사 해제" : "강사 지정"}
                            >
                              <GraduationCap size={14} />
                            </button>
                          )}
                          </>
                        )}
                        {user.role !== "admin" && (
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            disabled={isPending}
                            className="p-1 text-text-muted hover:text-error rounded transition-colors disabled:opacity-50"
                            title="회원 삭제"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-sm text-text-muted text-center py-8">검색 결과가 없습니다.</p>
        )}
      </div>

      {/* 프로필 검토 모달 */}
      {reviewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border-light">
              <h3 className="text-lg font-bold text-text">프로필 검토 — {reviewUser.name}</h3>
              <button onClick={() => setReviewUser(null)} className="p-1 text-text-muted hover:text-text rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* 프로필 이미지 */}
              {reviewUser.profile_image_url && (
                <div className="flex items-center gap-4">
                  <img src={reviewUser.profile_image_url} alt="프로필" className="w-20 h-20 rounded-xl object-cover" />
                  <div>
                    <p className="text-sm font-medium text-text">{reviewUser.name}</p>
                    <p className="text-xs text-text-muted">{reviewUser.email}</p>
                  </div>
                </div>
              )}
              {/* 전문분야 */}
              {reviewUser.specialties && reviewUser.specialties.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1.5">전문분야</p>
                  <div className="flex flex-wrap gap-1.5">
                    {reviewUser.specialties.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {/* 소개 */}
              {reviewUser.bio && (
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">소개</p>
                  <p className="text-sm text-text whitespace-pre-wrap bg-surface rounded-lg p-3">{reviewUser.bio}</p>
                </div>
              )}
              {/* 경력 */}
              {reviewUser.career_summary && (
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">주요 경력</p>
                  <div className="text-sm text-text bg-surface rounded-lg p-3 space-y-0.5">
                    {reviewUser.career_summary.split("\n").map((line, i) => <p key={i}>{line}</p>)}
                  </div>
                </div>
              )}
              {/* 영상 */}
              {reviewUser.video_url && (
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">강의 영상</p>
                  <a href={reviewUser.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{reviewUser.video_url}</a>
                </div>
              )}
              {/* PDF */}
              {reviewUser.profile_pdf_url && (
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">PDF 프로필</p>
                  <a
                    href={reviewUser.profile_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-surface rounded-lg text-sm text-primary hover:bg-border-light transition-colors"
                  >
                    <File size={16} className="text-red-500" /> PDF 보기
                  </a>
                </div>
              )}

              {/* 반려 사유 입력 */}
              {showRejectInput && (
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">반려 사유</p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    placeholder="반려 사유를 입력하세요..."
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 p-5 border-t border-border-light">
              {!showRejectInput ? (
                <>
                  <button
                    onClick={handleProfileApprove}
                    disabled={isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white text-sm font-medium rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={16} /> 승인
                  </button>
                  <button
                    onClick={() => setShowRejectInput(true)}
                    disabled={isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={16} /> 반려
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="flex-1 px-4 py-2.5 bg-surface text-text text-sm font-medium rounded-xl hover:bg-border-light transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleProfileReject}
                    disabled={isPending || !rejectReason.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={16} /> 반려 확인
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 다운로드 모달 */}
      {showDownloadModal && (
        <MemberDownloadModal
          members={members}
          filteredMembers={filtered}
          currentFilter={filter}
          onClose={() => setShowDownloadModal(false)}
          onDownloaded={handleDownloaded}
        />
      )}

      {/* 회원 선택 액션 바 */}
      <MemberActionBar
        selectedCount={selectedIds.size}
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* 강사 승격 확인 모달 */}
      {promotingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full">
            <div className="p-5 border-b border-border-light">
              <h3 className="text-lg font-bold text-text">강사 역할 부여</h3>
              <p className="text-sm text-text-sub mt-1">
                <strong>{promotingUser.name}</strong>님을 강사로 지정합니다.
              </p>
            </div>
            <div className="p-5 space-y-3">
              <button
                onClick={() => handlePromote("role_only")}
                disabled={isPending}
                className="w-full px-4 py-3 bg-surface border border-border-light rounded-xl text-left hover:bg-border-light transition-colors disabled:opacity-50"
              >
                <p className="text-sm font-medium text-text">역할만 변경</p>
                <p className="text-xs text-text-muted mt-0.5">강사 역할을 부여하고, 프로필은 나중에 설정합니다.</p>
              </button>
              <button
                onClick={() => handlePromote("with_profile")}
                disabled={isPending}
                className="w-full px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl text-left hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                <p className="text-sm font-medium text-primary">강사 프로필 설정</p>
                <p className="text-xs text-text-muted mt-0.5">역할을 부여하고 프로필 편집 페이지로 이동합니다.</p>
              </button>
            </div>
            <div className="p-5 border-t border-border-light">
              <button
                onClick={() => setPromotingUser(null)}
                className="w-full px-4 py-2 text-sm text-text-muted hover:text-text transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
