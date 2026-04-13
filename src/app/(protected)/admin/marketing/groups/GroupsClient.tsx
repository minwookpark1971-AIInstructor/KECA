"use client";

import { useState, useTransition, useCallback } from "react";
import { ArrowLeft, Plus, Trash2, X, Users, Edit2, UserMinus, ChevronRight, Calendar, CreditCard, GraduationCap } from "lucide-react";
import Link from "next/link";
import { createMarketingGroup, updateMarketingGroup, deleteMarketingGroup, addMembersToGroup, removeMemberFromGroup } from "@/lib/supabase/mutations";
import type { MarketingGroup, GroupFilterCriteria, Program, Profile } from "@/types";

const roleOptions = [
  { value: "pending", label: "승인대기" },
  { value: "approved", label: "승인완료" },
  { value: "associate", label: "준회원" },
  { value: "member", label: "정회원" },
  { value: "admin", label: "관리자" },
];

interface Props {
  groups: MarketingGroup[];
  programs: Program[];
}

export default function GroupsClient({ groups, programs }: Props) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Create/Edit modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<MarketingGroup | null>(null);

  // Detail modal
  const [detailGroup, setDetailGroup] = useState<MarketingGroup | null>(null);
  const [detailMembers, setDetailMembers] = useState<Profile[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupType, setGroupType] = useState<"static" | "dynamic">("dynamic");
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [instructorOnly, setInstructorOnly] = useState(false);
  const [joinDateFrom, setJoinDateFrom] = useState("");
  const [joinDateTo, setJoinDateTo] = useState("");
  const [selectedPrograms, setSelectedPrograms] = useState<Set<string>>(new Set());
  const [paymentStatus, setPaymentStatus] = useState<"any" | "paid" | "unpaid">("any");

  const resetForm = () => {
    setName("");
    setDescription("");
    setGroupType("dynamic");
    setSelectedRoles(new Set());
    setInstructorOnly(false);
    setJoinDateFrom("");
    setJoinDateTo("");
    setSelectedPrograms(new Set());
    setPaymentStatus("any");
  };

  const openCreateModal = () => {
    resetForm();
    setEditingGroup(null);
    setShowCreateModal(true);
  };

  const openEditModal = (group: MarketingGroup) => {
    const criteria = group.filter_criteria as GroupFilterCriteria | null;
    setName(group.name);
    setDescription(group.description || "");
    setGroupType(group.group_type || "dynamic");
    setSelectedRoles(new Set(criteria?.roles || []));
    setInstructorOnly(criteria?.is_instructor || false);
    setJoinDateFrom(criteria?.join_date_from || "");
    setJoinDateTo(criteria?.join_date_to || "");
    setSelectedPrograms(new Set(criteria?.enrolled_program_ids || []));
    setPaymentStatus(criteria?.payment_status || "any");
    setEditingGroup(group);
    setShowCreateModal(true);
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  };

  const toggleProgram = (programId: string) => {
    setSelectedPrograms((prev) => {
      const next = new Set(prev);
      if (next.has(programId)) next.delete(programId);
      else next.add(programId);
      return next;
    });
  };

  const buildFilterCriteria = (): GroupFilterCriteria => {
    const criteria: GroupFilterCriteria = {};
    if (selectedRoles.size > 0) criteria.roles = [...selectedRoles];
    if (instructorOnly) criteria.is_instructor = true;
    if (joinDateFrom) criteria.join_date_from = joinDateFrom;
    if (joinDateTo) criteria.join_date_to = joinDateTo;
    if (selectedPrograms.size > 0) criteria.enrolled_program_ids = [...selectedPrograms];
    if (paymentStatus !== "any") criteria.payment_status = paymentStatus;
    return criteria;
  };

  const handleCreateOrUpdate = () => {
    if (!name.trim()) {
      setMsg({ type: "error", text: "그룹명을 입력해주세요." });
      return;
    }

    startTransition(async () => {
      try {
        const filterCriteria = groupType === "dynamic" ? buildFilterCriteria() : {};

        if (editingGroup) {
          await updateMarketingGroup(editingGroup.id, {
            name: name.trim(),
            description: description.trim() || null,
            group_type: groupType,
            filter_criteria: filterCriteria,
          });
          setMsg({ type: "success", text: "수신 그룹이 수정되었습니다." });
        } else {
          await createMarketingGroup({
            name: name.trim(),
            description: description.trim() || undefined,
            group_type: groupType,
            filter_criteria: filterCriteria,
          });
          setMsg({ type: "success", text: "수신 그룹이 생성되었습니다." });
        }
        setShowCreateModal(false);
        resetForm();
        setEditingGroup(null);
      } catch {
        setMsg({ type: "error", text: editingGroup ? "수정에 실패했습니다." : "생성에 실패했습니다." });
      }
    });
  };

  const handleDelete = (id: string, groupName: string) => {
    if (!confirm(`"${groupName}" 그룹을 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      try {
        await deleteMarketingGroup(id);
        setMsg({ type: "success", text: "그룹이 삭제되었습니다." });
        if (detailGroup?.id === id) setDetailGroup(null);
      } catch {
        setMsg({ type: "error", text: "삭제에 실패했습니다." });
      }
    });
  };

  const openDetail = useCallback(async (group: MarketingGroup) => {
    setDetailGroup(group);
    setDetailMembers([]);

    const memberIds = group.member_ids;
    if (!memberIds || memberIds.length === 0) return;

    setDetailLoading(true);
    try {
      const res = await fetch(`/api/marketing/send-email?action=get_recipients&ids=${memberIds.join(",")}`);
      const data = await res.json();
      setDetailMembers(data.recipients || []);
    } catch {
      setMsg({ type: "error", text: "회원 정보를 불러오지 못했습니다." });
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleRemoveMember = (groupId: string, memberId: string) => {
    if (!confirm("이 회원을 그룹에서 제거하시겠습니까?")) return;
    startTransition(async () => {
      try {
        await removeMemberFromGroup(groupId, memberId);
        setDetailMembers((prev) => prev.filter((m) => m.id !== memberId));
        setMsg({ type: "success", text: "회원이 그룹에서 제거되었습니다." });
      } catch {
        setMsg({ type: "error", text: "회원 제거에 실패했습니다." });
      }
    });
  };

  const renderFilterSummary = (criteria: GroupFilterCriteria | null) => {
    if (!criteria) return null;
    const parts: string[] = [];
    if (criteria.roles?.length) parts.push(`역할: ${criteria.roles.join(", ")}`);
    if (criteria.is_instructor) parts.push("강사만");
    if (criteria.join_date_from || criteria.join_date_to) {
      parts.push(`가입일: ${criteria.join_date_from || "~"} ~ ${criteria.join_date_to || "~"}`);
    }
    if (criteria.enrolled_program_ids?.length) {
      const programNames = criteria.enrolled_program_ids
        .map((pid) => programs.find((p) => p.id === pid)?.title)
        .filter(Boolean);
      if (programNames.length) parts.push(`프로그램: ${programNames.join(", ")}`);
    }
    if (criteria.payment_status && criteria.payment_status !== "any") {
      parts.push(`결제: ${criteria.payment_status === "paid" ? "완료" : "미결제"}`);
    }
    return parts.length > 0 ? parts.join(" | ") : "필터 없음";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/marketing" className="p-1.5 rounded-lg hover:bg-surface transition-colors">
            <ArrowLeft size={20} className="text-text-sub" />
          </Link>
          <h1 className="text-2xl font-bold text-text">수신 그룹 관리</h1>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={15} />
          새 그룹
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      {/* 그룹 카드 목록 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.length === 0 ? (
          <p className="text-sm text-text-muted col-span-full text-center py-12">등록된 수신 그룹이 없습니다.</p>
        ) : (
          groups.map((g) => {
            const criteria = g.filter_criteria as GroupFilterCriteria | null;
            return (
              <div
                key={g.id}
                className="bg-white border border-border-light rounded-xl p-5 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => openDetail(g)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text">{g.name}</p>
                      {g.description && <p className="text-xs text-text-muted">{g.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(g); }}
                      className="p-1 text-text-muted hover:text-primary rounded"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(g.id, g.name); }}
                      disabled={isPending}
                      className="p-1 text-text-muted hover:text-error rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Type badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${g.group_type === "static" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}>
                    {g.group_type === "static" ? "정적 그룹" : "동적 그룹"}
                  </span>
                  <span className="text-xs text-text-muted">{g.member_count || 0}명</span>
                </div>

                {/* Filter tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {criteria?.roles?.map((r) => (
                    <span key={r} className="px-2 py-0.5 text-xs bg-surface rounded-full text-text-sub">{r}</span>
                  ))}
                  {criteria?.is_instructor && (
                    <span className="px-2 py-0.5 text-xs bg-purple-50 rounded-full text-purple-600">강사</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-text-muted">
                    {new Date(g.created_at).toLocaleDateString("ko")} 생성
                  </p>
                  <ChevronRight size={14} className="text-text-muted" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 상세 모달 */}
      {detailGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border-light">
              <div>
                <h3 className="text-lg font-bold text-text">{detailGroup.name}</h3>
                {detailGroup.description && <p className="text-sm text-text-muted mt-0.5">{detailGroup.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setDetailGroup(null); openEditModal(detailGroup); }} className="p-1.5 text-text-muted hover:text-primary rounded-lg hover:bg-surface">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => setDetailGroup(null)} className="p-1 text-text-muted hover:text-text">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {/* Group info */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-0.5 text-xs rounded-full ${detailGroup.group_type === "static" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}>
                  {detailGroup.group_type === "static" ? "정적 그룹" : "동적 그룹"}
                </span>
                <span className="text-xs text-text-muted">
                  {new Date(detailGroup.created_at).toLocaleDateString("ko")} 생성
                </span>
              </div>

              {/* Filter summary */}
              {detailGroup.group_type !== "static" && (
                <div className="mb-4 p-3 bg-surface rounded-lg">
                  <p className="text-xs font-medium text-text-sub mb-1">필터 조건</p>
                  <p className="text-xs text-text-muted">
                    {renderFilterSummary(detailGroup.filter_criteria as GroupFilterCriteria | null)}
                  </p>
                </div>
              )}

              {/* Member list */}
              <div className="mt-4">
                <p className="text-sm font-medium text-text mb-3">
                  회원 목록 ({detailGroup.member_count || detailMembers.length}명)
                </p>

                {detailLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : detailMembers.length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-6">등록된 회원이 없습니다.</p>
                ) : (
                  <div className="space-y-1">
                    {detailMembers.map((m) => (
                      <div key={m.id} className="flex items-center justify-between px-3 py-2 bg-surface rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-text">{m.name}</p>
                          <p className="text-xs text-text-muted">{m.email} {m.phone ? `| ${m.phone}` : ""}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-xs bg-white border border-border-light rounded-full text-text-sub">{m.role}</span>
                          <button
                            onClick={() => handleRemoveMember(detailGroup.id, m.id)}
                            disabled={isPending}
                            className="p-1 text-text-muted hover:text-error rounded"
                            title="그룹에서 제거"
                          >
                            <UserMinus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 생성/수정 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border-light">
              <h3 className="text-lg font-bold text-text">{editingGroup ? "수신 그룹 수정" : "새 수신 그룹"}</h3>
              <button onClick={() => { setShowCreateModal(false); setEditingGroup(null); }} className="p-1 text-text-muted hover:text-text"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* 그룹명 */}
              <div>
                <label className="text-sm font-medium text-text">그룹명</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 정회원 전체" className="w-full mt-1 px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              {/* 설명 */}
              <div>
                <label className="text-sm font-medium text-text">설명</label>
                <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="그룹에 대한 간단한 설명" className="w-full mt-1 px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              {/* 그룹 유형 */}
              <div>
                <label className="text-sm font-medium text-text mb-2 block">그룹 유형</label>
                <div className="flex gap-3">
                  <label className={`flex-1 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${groupType === "dynamic" ? "border-primary bg-primary/5" : "border-border-light hover:bg-surface"}`}>
                    <input type="radio" name="groupType" value="dynamic" checked={groupType === "dynamic"} onChange={() => setGroupType("dynamic")} className="hidden" />
                    <p className="text-sm font-medium text-text">동적 그룹</p>
                    <p className="text-xs text-text-muted mt-0.5">필터 조건으로 자동 구성</p>
                  </label>
                  <label className={`flex-1 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${groupType === "static" ? "border-blue-500 bg-blue-50" : "border-border-light hover:bg-surface"}`}>
                    <input type="radio" name="groupType" value="static" checked={groupType === "static"} onChange={() => setGroupType("static")} className="hidden" />
                    <p className="text-sm font-medium text-text">정적 그룹</p>
                    <p className="text-xs text-text-muted mt-0.5">회원을 직접 선택</p>
                  </label>
                </div>
              </div>

              {/* 동적 그룹: 필터 옵션 */}
              {groupType === "dynamic" && (
                <>
                  {/* 역할 필터 */}
                  <div>
                    <label className="text-sm font-medium text-text mb-2 block">회원 역할 필터</label>
                    <div className="flex flex-wrap gap-2">
                      {roleOptions.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-lg cursor-pointer hover:bg-border-light">
                          <input type="checkbox" checked={selectedRoles.has(opt.value)} onChange={() => toggleRole(opt.value)} className="rounded border-border text-primary focus:ring-primary/20" />
                          <span className="text-sm text-text">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 강사 필터 */}
                  <label className="flex items-center gap-2 px-3 py-2 bg-surface rounded-lg cursor-pointer">
                    <input type="checkbox" checked={instructorOnly} onChange={(e) => setInstructorOnly(e.target.checked)} className="rounded border-border text-primary focus:ring-primary/20" />
                    <span className="text-sm text-text">강사만 포함</span>
                  </label>

                  {/* 가입일 범위 */}
                  <div>
                    <label className="text-sm font-medium text-text mb-2 flex items-center gap-1.5">
                      <Calendar size={14} />
                      가입일 범위
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={joinDateFrom}
                        onChange={(e) => setJoinDateFrom(e.target.value)}
                        className="flex-1 px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <span className="text-sm text-text-muted">~</span>
                      <input
                        type="date"
                        value={joinDateTo}
                        onChange={(e) => setJoinDateTo(e.target.value)}
                        className="flex-1 px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* 교육 프로그램 */}
                  <div>
                    <label className="text-sm font-medium text-text mb-2 flex items-center gap-1.5">
                      <GraduationCap size={14} />
                      교육 프로그램 필터
                    </label>
                    {programs.length === 0 ? (
                      <p className="text-xs text-text-muted">등록된 교육 프로그램이 없습니다.</p>
                    ) : (
                      <div className="max-h-32 overflow-y-auto space-y-1 border border-border-light rounded-lg p-2">
                        {programs.map((prog) => (
                          <label key={prog.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-surface cursor-pointer">
                            <input type="checkbox" checked={selectedPrograms.has(prog.id)} onChange={() => toggleProgram(prog.id)} className="rounded border-border text-primary focus:ring-primary/20" />
                            <span className="text-sm text-text truncate">{prog.title}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 결제 상태 */}
                  <div>
                    <label className="text-sm font-medium text-text mb-2 flex items-center gap-1.5">
                      <CreditCard size={14} />
                      결제 상태
                    </label>
                    <div className="flex gap-2">
                      {[
                        { value: "any" as const, label: "전체" },
                        { value: "paid" as const, label: "결제완료" },
                        { value: "unpaid" as const, label: "미결제" },
                      ].map((opt) => (
                        <label key={opt.value} className={`flex-1 px-3 py-2 rounded-lg border text-center cursor-pointer transition-colors text-sm ${paymentStatus === opt.value ? "border-primary bg-primary/5 text-primary font-medium" : "border-border-light text-text-sub hover:bg-surface"}`}>
                          <input type="radio" name="paymentStatus" value={opt.value} checked={paymentStatus === opt.value} onChange={() => setPaymentStatus(opt.value)} className="hidden" />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* 정적 그룹: 직접 선택 안내 */}
              {groupType === "static" && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-sm text-blue-700 mb-2">정적 그룹은 회원관리에서 회원을 선택하여 추가할 수 있습니다.</p>
                  <button type="button" disabled className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-600 text-sm rounded-lg opacity-70 cursor-not-allowed">
                    <Users size={14} />
                    회원 직접 선택
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2 p-5 border-t border-border-light">
              <button onClick={() => { setShowCreateModal(false); setEditingGroup(null); }} className="flex-1 px-4 py-2.5 text-sm text-text-sub bg-surface rounded-xl hover:bg-border-light transition-colors">취소</button>
              <button onClick={handleCreateOrUpdate} disabled={isPending} className="flex-1 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50">
                {isPending ? (editingGroup ? "수정 중..." : "생성 중...") : (editingGroup ? "수정" : "생성")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
