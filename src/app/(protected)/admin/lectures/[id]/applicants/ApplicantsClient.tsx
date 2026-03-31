"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateApplicationStatus, bulkUpdateApplicationStatus, selectApplicants, updateApplication, deleteApplication } from "@/lib/supabase/mutations";
import type { Application, ApplicationStatus, Lecture, StatusHistory } from "@/types";
import { X, FileText, ExternalLink, CheckSquare, Square, Clock, Trash2 } from "lucide-react";
import { useToast } from "@/components/layout/Toast";

const statusMap: Record<ApplicationStatus, { label: string; cls: string }> = {
  pending: { label: "대기중", cls: "bg-gray-100 text-gray-500" },
  deposit_pending: { label: "결제대기", cls: "bg-yellow-100 text-yellow-600" },
  submitted: { label: "접수완료", cls: "bg-blue-100 text-blue-600" },
  reviewing: { label: "심사중", cls: "bg-yellow-100 text-yellow-700" },
  selected: { label: "강사확정", cls: "bg-green-100 text-green-700" },
  confirmed: { label: "최종확정", cls: "bg-emerald-100 text-emerald-700" },
  standby: { label: "예비강사", cls: "bg-amber-100 text-amber-600" },
  rejected: { label: "미선발", cls: "bg-red-100 text-red-400" },
  cancelled: { label: "취소", cls: "bg-gray-100 text-gray-400" },
};

// 관리자가 변경 가능한 상태 목록
const changeableStatuses: { value: ApplicationStatus; label: string }[] = [
  { value: "pending", label: "대기중" },
  { value: "submitted", label: "접수완료" },
  { value: "reviewing", label: "심사중" },
  { value: "selected", label: "강사확정" },
  { value: "standby", label: "예비강사" },
  { value: "rejected", label: "미선발" },
];

interface Props {
  lecture: Lecture;
  applications: Application[];
  adminId: string;
  statusHistories?: Record<string, StatusHistory[]>;
}

function isImageFile(name: string) {
  return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(name);
}

function isPdfFile(name: string) {
  return /\.pdf$/i.test(name);
}

export default function ApplicantsClient({ lecture, applications, adminId, statusHistories }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [changingStatus, setChangingStatus] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // 모달 상태
  const [detailApp, setDetailApp] = useState<Application | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [standbyRank, setStandbyRank] = useState<number>(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");

  const maxSelected = lecture.required_count;
  const maxStandby = Math.ceil(lecture.required_count * 0.5);

  // 상태별 카운트
  const counts = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    submitted: applications.filter((a) => a.status === "submitted").length,
    reviewing: applications.filter((a) => a.status === "reviewing").length,
    selected: applications.filter((a) => a.status === "selected" || a.status === "confirmed").length,
    standby: applications.filter((a) => a.status === "standby").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const alreadyFinalized = applications.some(
    (a) => a.status === "selected" || a.status === "confirmed" || a.status === "standby" || a.status === "rejected"
  );

  // ─── 체크박스 ───
  const allChecked = applications.length > 0 && checkedIds.size === applications.length;
  function toggleAll() {
    if (allChecked) setCheckedIds(new Set());
    else setCheckedIds(new Set(applications.map((a) => a.id)));
  }
  function toggleCheck(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ─── 개별 상태 변경 (드롭다운) ───
  async function handleStatusChange(app: Application, newStatus: ApplicationStatus) {
    if (newStatus === app.status) return;
    // 서류 미제출(pending) 지원자 선발 차단
    if (app.status === "pending" && (newStatus === "selected" || newStatus === "standby")) {
      toast("error", "서류 미제출 지원자는 선발할 수 없습니다.");
      return;
    }
    if (newStatus === "selected" && counts.selected >= maxSelected) {
      toast("error", `강사확정은 최대 ${maxSelected}명까지 가능합니다.`);
      return;
    }
    if (newStatus === "standby" && counts.standby >= maxStandby) {
      toast("error", `예비강사는 최대 ${maxStandby}명까지 가능합니다.`);
      return;
    }
    setChangingStatus(app.id);
    try {
      await updateApplicationStatus(app.id, newStatus, adminId);
      toast("success", `${app.applicant?.name ?? "지원자"}: ${statusMap[newStatus].label}(으)로 변경됨`);
      router.refresh();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "상태 변경 실패");
    } finally {
      setChangingStatus(null);
    }
  }

  // ─── 일괄 상태 변경 ───
  async function handleBulkChange() {
    if (!bulkStatus || checkedIds.size === 0) return;
    const statusLabel = changeableStatuses.find((s) => s.value === bulkStatus)?.label ?? bulkStatus;
    if (!confirm(`선택한 ${checkedIds.size}명을 "${statusLabel}"(으)로 일괄 변경하시겠습니까?`)) return;
    const changes = Array.from(checkedIds).map((id) => ({ id, status: bulkStatus }));
    setConfirming(true);
    try {
      await bulkUpdateApplicationStatus(lecture.id, changes, adminId);
      toast("success", `${changes.length}명 일괄 변경 완료`);
      setCheckedIds(new Set());
      setBulkStatus("");
      router.refresh();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "일괄 변경 실패");
    } finally {
      setConfirming(false);
    }
  }

  // ─── 선발 확정 ───
  async function handleFinalConfirm() {
    const selectedIds = applications.filter((a) => a.status === "selected").map((a) => a.id);
    const standbyIds = applications.filter((a) => a.status === "standby").map((a) => a.id);
    const reviewingOrSubmitted = applications.filter(
      (a) => a.status === "submitted" || a.status === "reviewing"
    );

    if (selectedIds.length === 0 && standbyIds.length === 0) {
      toast("error", "강사확정 또는 예비강사로 지정된 지원자가 없습니다.");
      return;
    }

    const msg = [
      `강사확정: ${selectedIds.length}명`,
      standbyIds.length > 0 ? `예비강사: ${standbyIds.length}명` : null,
      reviewingOrSubmitted.length > 0 ? `미선발 처리: ${reviewingOrSubmitted.length}명` : null,
    ].filter(Boolean).join("\n");

    if (!confirm(`${msg}\n\n확정 시 지원 강사에게 결과가 통보됩니다.\n위 내용으로 선발을 확정하시겠습니까?`)) return;

    setConfirming(true);
    try {
      await selectApplicants(lecture.id, selectedIds, standbyIds);
      toast("success", "선발이 확정되었습니다.");
      router.refresh();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "선발 확정 실패");
    } finally {
      setConfirming(false);
    }
  }

  // ─── 모달 ───
  function openDetail(app: Application) {
    setDetailApp(app);
    setAdminNote(app.admin_note ?? "");
    setRejectionReason(app.rejection_reason ?? "");
    setStandbyRank(app.standby_rank ?? 1);
  }

  async function handleModalStatusChange(newStatus: ApplicationStatus) {
    if (!detailApp || newStatus === detailApp.status) return;
    if (detailApp.status === "pending" && (newStatus === "selected" || newStatus === "standby")) {
      toast("error", "서류 미제출 지원자는 선발할 수 없습니다.");
      return;
    }
    setChangingStatus(detailApp.id);
    try {
      await updateApplicationStatus(detailApp.id, newStatus, adminId, {
        standby_rank: newStatus === "standby" ? standbyRank : undefined,
        rejection_reason: newStatus === "rejected" ? rejectionReason : undefined,
      });
      toast("success", `${statusMap[newStatus].label}(으)로 변경됨`);
      setDetailApp(null);
      router.refresh();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "상태 변경 실패");
    } finally {
      setChangingStatus(null);
    }
  }

  async function handleSaveNote() {
    if (!detailApp) return;
    setSavingNote(true);
    try {
      await updateApplication(detailApp.id, { admin_note: adminNote });
      toast("success", "메모가 저장되었습니다.");
      router.refresh();
    } catch {
      toast("error", "메모 저장 실패");
    } finally {
      setSavingNote(false);
    }
  }

  const detailHistory = detailApp && statusHistories?.[detailApp.id];

  return (
    <div className="space-y-4">
      {/* 상태별 카운터 */}
      <div className="bg-white rounded-xl border border-border-light p-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="text-text-sub">전체: <strong className="text-text">{counts.total}</strong></span>
          <span className="text-text-sub">대기중: <strong>{counts.pending}</strong></span>
          <span className="text-text-sub">접수완료: <strong className="text-blue-600">{counts.submitted}</strong></span>
          <span className="text-text-sub">심사중: <strong className="text-yellow-600">{counts.reviewing}</strong></span>
          <span className="text-text-sub">강사확정: <strong className="text-green-600">{counts.selected}</strong>/{maxSelected}</span>
          <span className="text-text-sub">예비강사: <strong className="text-amber-600">{counts.standby}</strong>/{maxStandby}</span>
          <span className="text-text-sub">미선발: <strong className="text-red-400">{counts.rejected}</strong></span>
          {counts.selected >= maxSelected && (
            <span className="ml-auto px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">선발 완료</span>
          )}
        </div>
      </div>

      {/* 일괄 변경 + 선발 확정 */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={toggleAll} className="flex items-center gap-1.5 text-sm text-text-sub hover:text-text transition-colors">
          {allChecked ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
          전체선택
        </button>

        {checkedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="border border-border-light rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">일괄 상태 변경</option>
              {changeableStatuses.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={handleBulkChange}
              disabled={!bulkStatus || confirming}
              className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {confirming ? "처리 중..." : `${checkedIds.size}명 변경`}
            </button>
          </div>
        )}

        <div className="ml-auto">
          {!alreadyFinalized ? (
            <button
              onClick={handleFinalConfirm}
              disabled={confirming || (counts.selected === 0 && counts.standby === 0)}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {confirming ? "처리 중..." : "선발 확정"}
            </button>
          ) : (
            <span className="text-sm text-green-600 font-medium">선발 확정 완료</span>
          )}
        </div>
      </div>

      {/* 지원자 목록 테이블 */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center text-text-sub">아직 지원자가 없습니다.</div>
      ) : (
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border-light">
                <th className="w-10 px-3 py-3"></th>
                <th className="text-left px-4 py-3 text-text-sub font-medium">이름</th>
                <th className="text-left px-4 py-3 text-text-sub font-medium hidden sm:table-cell">연락처</th>
                <th className="text-left px-4 py-3 text-text-sub font-medium hidden md:table-cell">전문분야</th>
                <th className="text-left px-4 py-3 text-text-sub font-medium hidden lg:table-cell">지원일</th>
                <th className="text-left px-4 py-3 text-text-sub font-medium">상태</th>
                <th className="text-left px-4 py-3 text-text-sub font-medium hidden md:table-cell">서류</th>
                <th className="w-10 px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {applications.map((app) => {
                const st = statusMap[app.status];
                const docCount = (app.document_urls?.length ?? 0) + (app.cover_letter ? 1 : 0);
                const isChecked = checkedIds.has(app.id);
                const isChanging = changingStatus === app.id;
                const rowBg = app.status === "selected" || app.status === "confirmed"
                  ? "bg-green-50/50"
                  : app.status === "standby"
                  ? "bg-amber-50/50"
                  : app.status === "rejected"
                  ? "bg-red-50/30"
                  : "";

                return (
                  <tr
                    key={app.id}
                    className={`hover:bg-surface/50 transition-colors ${rowBg} ${app.status === "pending" ? "opacity-60" : ""}`}
                  >
                    <td className="px-3 py-3 text-center">
                      <button onClick={() => toggleCheck(app.id)} className="text-text-muted hover:text-primary">
                        {isChecked ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium text-text cursor-pointer" onClick={() => openDetail(app)}>
                      {app.applicant?.name ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-text-sub hidden sm:table-cell">{app.applicant?.phone ?? "-"}</td>
                    <td className="px-4 py-3 text-text-sub hidden md:table-cell">{app.applicant?.specialties?.join(", ") || "-"}</td>
                    <td className="px-4 py-3 text-text-sub hidden lg:table-cell">{new Date(app.created_at).toLocaleDateString("ko-KR")}</td>
                    <td className="px-4 py-3">
                      {isChanging ? (
                        <span className="text-xs text-text-muted">변경 중...</span>
                      ) : (
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app, e.target.value as ApplicationStatus)}
                          onClick={(e) => e.stopPropagation()}
                          className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 ${st.cls}`}
                        >
                          {changeableStatuses.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                          {/* 현재 상태가 confirmed 등 리스트에 없으면 표시 */}
                          {!changeableStatuses.find((s) => s.value === app.status) && (
                            <option value={app.status}>{statusMap[app.status]?.label}</option>
                          )}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {docCount > 0 ? (
                        <span className="text-xs text-primary cursor-pointer" onClick={() => openDetail(app)}>{docCount}건</span>
                      ) : (
                        <span className="text-xs text-text-muted">없음</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm(`"${app.applicant?.name ?? "지원자"}"의 지원을 삭제하시겠습니까?`)) return;
                          try {
                            await deleteApplication(app.id, adminId, true);
                            toast("success", "지원이 삭제되었습니다.");
                            router.refresh();
                          } catch (err) {
                            toast("error", err instanceof Error ? err.message : "삭제 실패");
                          }
                        }}
                        className="text-text-muted hover:text-red-500 transition-colors"
                        title="지원 삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ 지원자 상세 모달 ═══ */}
      {detailApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetailApp(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* 헤더 */}
            <div className="px-6 pt-5 pb-3 border-b border-border-light flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-text">{detailApp.applicant?.name ?? "지원자"}</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  {detailApp.applicant?.email} · {detailApp.applicant?.phone ?? "연락처 미등록"}
                </p>
              </div>
              <button onClick={() => setDetailApp(null)} className="text-text-muted hover:text-text"><X size={20} /></button>
            </div>

            {/* 내용 */}
            <div className="px-6 py-4 overflow-y-auto flex-1 space-y-5">

              {/* 현재 상태 + 변경 */}
              <div className="bg-surface rounded-lg p-4">
                <h3 className="font-semibold text-text text-sm mb-3">상태 변경</h3>
                <div className="flex flex-wrap gap-2">
                  {changeableStatuses.map((opt) => {
                    const isActive = detailApp.status === opt.value;
                    const sm = statusMap[opt.value];
                    const isPendingBlock = detailApp.status === "pending" && (opt.value === "selected" || opt.value === "standby");
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleModalStatusChange(opt.value)}
                        disabled={isActive || changingStatus === detailApp.id || isPendingBlock}
                        title={isPendingBlock ? "서류 미제출 지원자는 선발할 수 없습니다" : undefined}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                          isActive
                            ? sm.cls + " border-current ring-2 ring-offset-1 ring-current/20"
                            : isPendingBlock
                            ? "border-border-light text-text-muted opacity-40 cursor-not-allowed"
                            : "border-border-light text-text-sub hover:border-gray-300"
                        } disabled:cursor-default`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* 예비강사 순위 입력 */}
                {detailApp.status === "standby" && (
                  <div className="mt-3 flex items-center gap-2">
                    <label className="text-xs text-text-sub">예비 순위:</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={standbyRank}
                      onChange={(e) => setStandbyRank(Number(e.target.value))}
                      className="w-16 border border-border-light rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      onClick={async () => {
                        await updateApplicationStatus(detailApp.id, "standby", adminId, { standby_rank: standbyRank });
                        toast("success", `예비 순위 ${standbyRank}순위로 저장됨`);
                        router.refresh();
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      순위 저장
                    </button>
                  </div>
                )}

                {/* 미선발 사유 입력 */}
                {detailApp.status === "rejected" && (
                  <div className="mt-3">
                    <label className="text-xs text-text-sub block mb-1">미선발 사유 (선택)</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={2}
                      placeholder="미선발 사유를 입력하세요..."
                      className="w-full border border-border-light rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                    <button
                      onClick={async () => {
                        await updateApplication(detailApp.id, { rejection_reason: rejectionReason });
                        toast("success", "미선발 사유 저장됨");
                        router.refresh();
                      }}
                      className="mt-1 text-xs text-primary hover:underline"
                    >
                      사유 저장
                    </button>
                  </div>
                )}
              </div>

              {/* pending 상태 안내 */}
              {detailApp.status === "pending" && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                  <p className="font-medium text-amber-700">서류 제출 대기 중</p>
                  <p className="text-amber-600 mt-1">지원자가 서류를 제출해야 선발이 가능합니다.</p>
                </div>
              )}

              {/* 프로필 */}
              <div className="bg-surface rounded-lg p-4 text-sm">
                <h3 className="font-semibold text-text mb-2">프로필</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-text-sub/60">전문분야:</span> <span className="text-text">{detailApp.applicant?.specialties?.join(", ") || "-"}</span></div>
                  <div><span className="text-text-sub/60">지원일:</span> <span className="text-text">{new Date(detailApp.created_at).toLocaleDateString("ko-KR")}</span></div>
                </div>
                {detailApp.applicant?.bio && (
                  <div className="mt-2 pt-2 border-t border-border-light">
                    <span className="text-text-sub/60 text-xs">소개:</span>
                    <p className="text-text mt-1">{detailApp.applicant.bio}</p>
                  </div>
                )}
              </div>

              {/* 자기소개서 */}
              {detailApp.cover_letter && (
                <div>
                  <h3 className="font-semibold text-text mb-2 text-sm">자기소개서</h3>
                  <div className="bg-surface rounded-lg p-4 text-sm text-text-sub whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {detailApp.cover_letter}
                  </div>
                </div>
              )}

              {/* 첨부 서류 */}
              {detailApp.document_urls && detailApp.document_urls.length > 0 && (
                <div>
                  <h3 className="font-semibold text-text mb-2 text-sm">첨부 서류 ({detailApp.document_urls.length}건)</h3>
                  <div className="space-y-2">
                    {detailApp.document_urls.map((doc: { name: string; url: string }, i: number) => {
                      const canPreview = isImageFile(doc.name) || isPdfFile(doc.name);
                      return (
                        <div key={i} className="bg-surface rounded-lg overflow-hidden">
                          <div className="flex items-center gap-2 px-4 py-2.5">
                            <FileText size={14} className="text-primary shrink-0" />
                            <span className="text-sm text-text flex-1 truncate">{doc.name}</span>
                            {canPreview && (
                              <button onClick={() => { setPreviewUrl(doc.url); setPreviewName(doc.name); }} className="text-xs text-primary hover:underline shrink-0">미리보기</button>
                            )}
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                              <ExternalLink size={14} className="text-text-muted hover:text-primary" />
                            </a>
                          </div>
                          {isImageFile(doc.name) && (
                            <div className="px-4 pb-3">
                              <img src={doc.url} alt={doc.name} className="max-h-48 rounded-lg border border-border-light object-contain" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 관리자 메모 */}
              <div>
                <h3 className="font-semibold text-text mb-2 text-sm">관리자 메모</h3>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={2}
                  placeholder="관리자 메모를 입력하세요..."
                  className="w-full border border-border-light rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                <div className="mt-2 flex justify-end">
                  <button onClick={handleSaveNote} disabled={savingNote} className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50">
                    {savingNote ? "저장 중..." : "메모 저장"}
                  </button>
                </div>
              </div>

              {/* 지원자 삭제 (관리자) */}
              <div className="pt-2 border-t border-border-light">
                <button
                  onClick={async () => {
                    if (!detailApp) return;
                    if (!confirm(`"${detailApp.applicant?.name ?? "지원자"}"의 지원을 완전히 삭제하시겠습니까?\n첨부 파일과 이력이 모두 삭제되며 복구할 수 없습니다.`)) return;
                    try {
                      await deleteApplication(detailApp.id, adminId, true);
                      toast("success", "지원이 삭제되었습니다.");
                      setDetailApp(null);
                      router.refresh();
                    } catch (e) {
                      toast("error", e instanceof Error ? e.message : "삭제 실패");
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={12} />
                  지원 삭제
                </button>
              </div>

              {/* 상태 변경 이력 */}
              {detailHistory && detailHistory.length > 0 && (
                <div>
                  <h3 className="font-semibold text-text mb-2 text-sm">상태 변경 이력</h3>
                  <div className="space-y-2">
                    {detailHistory.map((h) => (
                      <div key={h.id} className="flex items-start gap-3 text-xs">
                        <Clock size={12} className="text-text-muted mt-0.5 shrink-0" />
                        <div>
                          <span className="text-text-sub">{new Date(h.changed_at).toLocaleString("ko-KR")}</span>
                          <span className="mx-1.5 text-text-muted">·</span>
                          {h.previous_status && (
                            <>
                              <span className={`px-1.5 py-0.5 rounded ${statusMap[h.previous_status]?.cls ?? ""}`}>
                                {statusMap[h.previous_status]?.label ?? h.previous_status}
                              </span>
                              <span className="mx-1 text-text-muted">→</span>
                            </>
                          )}
                          <span className={`px-1.5 py-0.5 rounded ${statusMap[h.new_status]?.cls ?? ""}`}>
                            {statusMap[h.new_status]?.label ?? h.new_status}
                          </span>
                          {h.memo && <p className="text-text-muted mt-0.5">{h.memo}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 파일 미리보기 모달 */}
      {previewUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPreviewUrl(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-4 py-3 border-b border-border-light flex items-center justify-between shrink-0">
              <span className="text-sm font-medium text-text truncate">{previewName}</span>
              <div className="flex items-center gap-2">
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">새 탭에서 열기</a>
                <button onClick={() => setPreviewUrl(null)} className="text-text-muted hover:text-text"><X size={18} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              {isPdfFile(previewName) ? (
                <iframe src={previewUrl} className="w-full h-full" title={previewName} />
              ) : isImageFile(previewName) ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 p-4">
                  <img src={previewUrl} alt={previewName} className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-text-sub">
                  <p>이 파일은 미리보기를 지원하지 않습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
